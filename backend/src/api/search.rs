use std::collections::HashSet;

use axum::{extract::State, http::StatusCode, response::Json};

use crate::{
    api::governance::{parse_canonical, GovernanceEntry},
    models::{
        ApiError, ApiSearchResponse, ClarityLabel, GovernanceStatus, GovernanceTag,
        SearchRequest, SearchResultItem,
    },
    AppState,
};

type ApiResult<T> = Result<Json<T>, (StatusCode, Json<ApiError>)>;

fn err(status: StatusCode, msg: impl ToString) -> (StatusCode, Json<ApiError>) {
    (status, Json(ApiError { error: msg.to_string() }))
}

const SCORE_THRESHOLD: f64 = 0.6;
const CANONICAL_PATH: &str = "/agent/canonical-sources.md";
const DELETED_PATH: &str = "/agent/deleted-files.json";

fn score_to_clarity(score: f64) -> (u32, ClarityLabel) {
    let clarity_score = (score * 100.0).round() as u32;
    let label = match clarity_score {
        80.. => ClarityLabel::Crystal,
        60..=79 => ClarityLabel::Clear,
        40..=59 => ClarityLabel::Murky,
        _ => ClarityLabel::Toxic,
    };
    (clarity_score, label)
}

fn find_governance(source: &str, entries: &[GovernanceEntry]) -> Option<GovernanceTag> {
    for e in entries {
        if e.canonical == source {
            return Some(GovernanceTag {
                status: GovernanceStatus::Canonical,
                term: e.term.clone(),
            });
        }
        if e.rejected == source {
            return Some(GovernanceTag {
                status: GovernanceStatus::Rejected,
                term: e.term.clone(),
            });
        }
    }
    None
}

pub async fn search_handler(
    State(state): State<AppState>,
    Json(req): Json<SearchRequest>,
) -> ApiResult<ApiSearchResponse> {
    let hd_resp = state
        .hd
        .search(&req)
        .await
        .map_err(|e| err(StatusCode::BAD_GATEWAY, e))?;

    let canonical_md = state.hd.fs_read(CANONICAL_PATH).await.unwrap_or_default();
    let gov_entries = parse_canonical(&canonical_md);

    let deleted_filenames: HashSet<String> = {
        let raw = state.hd.fs_read(DELETED_PATH).await.unwrap_or_default();
        if raw.is_empty() {
            HashSet::new()
        } else {
            let paths: Vec<String> = serde_json::from_str(&raw).unwrap_or_default();
            paths
                .into_iter()
                .filter_map(|p| p.split('/').last().map(|s| s.to_string()))
                .collect()
        }
    };

    let results = hd_resp
        .results
        .into_iter()
        .filter(|hit| {
            let source = hit
                .extra
                .get("page_title")
                .and_then(|v| v.as_str())
                .or_else(|| hit.source.as_deref())
                .unwrap_or("");
            let filename = source.split('/').last().unwrap_or(source);
            !deleted_filenames.contains(filename)
        })
        .filter(|hit| hit.score.unwrap_or(0.0) >= SCORE_THRESHOLD)
        .map(|hit| {
            let score = hit.score.unwrap_or(0.0);
            let (clarity_score, clarity_label) = score_to_clarity(score);
            let source = hit
                .extra
                .get("page_title")
                .and_then(|v| v.as_str())
                .filter(|s| !s.is_empty())
                .or_else(|| hit.source.as_deref())
                .unwrap_or("unknown")
                .to_string();
            let governance = find_governance(&source, &gov_entries);
            SearchResultItem {
                content: hit.content,
                source,
                similarity: score,
                clarity_score,
                clarity_label,
                governance,
            }
        })
        .collect();

    Ok(Json(ApiSearchResponse { results }))
}
