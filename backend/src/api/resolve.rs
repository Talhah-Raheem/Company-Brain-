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

// Non-markdown format — HD's write pipeline mangles `##` headings (strips one `#`
// and injects phantom separator lines), so we use plain-text delimiters.

/// Removes the `[term: {term}]` block (from its header line to the next blank line + [term:).
fn remove_section(content: &str, term: &str) -> String {
    let marker = format!("[term: {term}]");
    let mut out = Vec::new();
    let mut skip = false;

    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed == marker {
            skip = true;
            continue;
        }
        if skip && trimmed.starts_with("[term:") {
            skip = false;
        }
        if !skip {
            out.push(line);
        }
    }

    // Trim trailing blank lines left behind by removal
    while out.last().map(|l| l.trim().is_empty()).unwrap_or(false) {
        out.pop();
    }

    out.join("\n")
}

pub async fn resolve_handler(
    State(state): State<AppState>,
    Json(req): Json<ResolveRequest>,
) -> ApiResult<ResolveResponse> {
    let existing = state.hd.fs_read(CANONICAL_PATH).await.unwrap_or_default();

    let entry = format!(
        "[term: {}]\ncanonical: {}\nrejected: {}\n",
        req.term, req.canonical_source, req.rejected_source
    );

    let stripped = remove_section(&existing, &req.term);

    let updated = if stripped.trim().is_empty() {
        format!("Canonical Sources — authoritative records for AI agents\n\n{entry}")
    } else {
        format!("{}\n\n{entry}", stripped.trim_end())
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
