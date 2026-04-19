use axum::{extract::State, http::StatusCode, response::Json};

use crate::{
    models::{ApiError, ResolveRequest, ResolveResponse},
    AppState,
};

type ApiResult<T> = Result<Json<T>, (StatusCode, Json<ApiError>)>;

fn err(status: StatusCode, msg: impl ToString) -> (StatusCode, Json<ApiError>) {
    (status, Json(ApiError { error: msg.to_string() }))
}

const CANONICAL_PATH: &str = "/agent/canonical-sources.md";

/// Removes the `## {term}` section and its lines from the markdown content.
fn remove_section(content: &str, term: &str) -> String {
    let heading = format!("## {term}");
    let mut out = Vec::new();
    let mut skip = false;

    for line in content.lines() {
        if line.trim() == heading.trim() {
            skip = true;
            continue;
        }
        if skip && line.starts_with("## ") {
            skip = false;
        }
        if !skip {
            out.push(line);
        }
    }

    out.join("\n")
}

pub async fn resolve_handler(
    State(state): State<AppState>,
    Json(req): Json<ResolveRequest>,
) -> ApiResult<ResolveResponse> {
    let existing = state.hd.fs_read(CANONICAL_PATH).await.unwrap_or_default();

    let entry = format!(
        "\n## {}\n- **Canonical:** {}\n- **Rejected:** {}\n",
        req.term, req.canonical_source, req.rejected_source
    );

    // Remove any existing section for this term so re-resolving cleanly replaces it
    let stripped = remove_section(&existing, &req.term);

    let updated = if stripped.trim().is_empty() {
        format!("# Canonical Sources\n{entry}")
    } else {
        format!("{stripped}{entry}")
    };

    state
        .hd
        .fs_write(CANONICAL_PATH, &updated)
        .await
        .map_err(|e| err(StatusCode::BAD_GATEWAY, e))?;

    Ok(Json(ResolveResponse {
        success: true,
        message: format!("\"{}\" is now canonical for \"{}\"", req.canonical_source, req.term),
    }))
}
