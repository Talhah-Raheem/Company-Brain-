use axum::{extract::State, http::StatusCode, response::Json};
use serde::Serialize;

use crate::{models::ApiError, AppState};

type ApiResult<T> = Result<Json<T>, (StatusCode, Json<ApiError>)>;

const CANONICAL_PATH: &str = "/agent/canonical-sources.md";

#[derive(Debug, Serialize)]
pub struct GovernanceEntry {
    pub term: String,
    pub canonical: String,
    pub rejected: String,
}

#[derive(Debug, Serialize)]
pub struct GovernanceResponse {
    pub entries: Vec<GovernanceEntry>,
}

pub async fn governance_handler(
    State(state): State<AppState>,
) -> ApiResult<GovernanceResponse> {
    let content = state.hd.fs_read(CANONICAL_PATH).await.unwrap_or_default();
    Ok(Json(GovernanceResponse { entries: parse_canonical(&content) }))
}

fn parse_canonical(md: &str) -> Vec<GovernanceEntry> {
    let mut entries = Vec::new();
    let mut term: Option<String> = None;
    let mut canonical = String::new();
    let mut rejected = String::new();

    fn flush(
        entries: &mut Vec<GovernanceEntry>,
        term: &mut Option<String>,
        canonical: &mut String,
        rejected: &mut String,
    ) {
        if let Some(t) = term.take() {
            if !canonical.is_empty() || !rejected.is_empty() {
                entries.push(GovernanceEntry {
                    term: t,
                    canonical: std::mem::take(canonical),
                    rejected: std::mem::take(rejected),
                });
            }
        }
    }

    for line in md.lines() {
        let line = line.trim();
        if let Some(rest) = line.strip_prefix("[term:").and_then(|r| r.strip_suffix(']')) {
            flush(&mut entries, &mut term, &mut canonical, &mut rejected);
            term = Some(rest.trim().to_string());
        } else if let Some(rest) = line.strip_prefix("canonical:") {
            canonical = rest.trim().to_string();
        } else if let Some(rest) = line.strip_prefix("rejected:") {
            rejected = rest.trim().to_string();
        }
    }
    flush(&mut entries, &mut term, &mut canonical, &mut rejected);

    entries
}
