use axum::{extract::State, http::StatusCode, response::Json};

use crate::{
    models::{ApiError, ApiSearchResponse, ClarityLabel, SearchRequest, SearchResultItem},
    AppState,
};

type ApiResult<T> = Result<Json<T>, (StatusCode, Json<ApiError>)>;

fn err(status: StatusCode, msg: impl ToString) -> (StatusCode, Json<ApiError>) {
    (status, Json(ApiError { error: msg.to_string() }))
}

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

pub async fn search_handler(
    State(state): State<AppState>,
    Json(req): Json<SearchRequest>,
) -> ApiResult<ApiSearchResponse> {
    let hd_resp = state
        .hd
        .search(&req)
        .await
        .map_err(|e| err(StatusCode::BAD_GATEWAY, e))?;

    let results = hd_resp
        .results
        .into_iter()
        .map(|hit| {
            let score = hit.score.unwrap_or(0.0);
            let (clarity_score, clarity_label) = score_to_clarity(score);
            SearchResultItem {
                content: hit.content,
                source: hit.extra.get("page_title")
                    .and_then(|v| v.as_str())
                    .filter(|s| !s.is_empty())
                    .or_else(|| hit.source.as_deref())
                    .unwrap_or("unknown")
                    .to_string(),
                similarity: score,
                clarity_score,
                clarity_label,
            }
        })
        .collect();

    Ok(Json(ApiSearchResponse { results }))
}
