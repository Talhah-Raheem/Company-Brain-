use std::collections::HashMap;

use axum::{extract::{Query, State}, http::StatusCode, response::Json};
use serde::Serialize;

use crate::{models::ApiError, AppState};

type ApiResult<T> = Result<Json<T>, (StatusCode, Json<ApiError>)>;

fn err(status: StatusCode, msg: impl ToString) -> (StatusCode, Json<ApiError>) {
    (status, Json(ApiError { error: msg.to_string() }))
}

#[derive(Debug, Serialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
}

#[derive(Debug, Serialize)]
pub struct FilesResponse {
    pub files: Vec<FileEntry>,
}

pub async fn list_files_handler(State(state): State<AppState>) -> ApiResult<FilesResponse> {
    let resp = state
        .hd
        .fs_cmd("find /uploads -type f")
        .await
        .map_err(|e| err(StatusCode::BAD_GATEWAY, e))?;

    let stdout = resp
        .get("stdout")
        .and_then(|v| v.as_str())
        .unwrap_or("");

    let files = stdout
        .lines()
        .filter(|l| !l.trim().is_empty())
        .map(|path| {
            let name = path.split('/').last().unwrap_or(path).to_string();
            FileEntry { name, path: path.to_string() }
        })
        .collect();

    Ok(Json(FilesResponse { files }))
}

#[derive(Debug, Serialize)]
pub struct FileContentResponse {
    pub path: String,
    pub content: String,
}

pub async fn file_content_handler(
    State(state): State<AppState>,
    Query(params): Query<HashMap<String, String>>,
) -> ApiResult<FileContentResponse> {
    let path = params
        .get("path")
        .ok_or_else(|| err(StatusCode::BAD_REQUEST, "missing path param"))?;

    if !path.starts_with("/uploads/") {
        return Err(err(StatusCode::BAD_REQUEST, "invalid path"));
    }

    let resp = state
        .hd
        .fs_cmd(&format!("cat {path}"))
        .await
        .map_err(|e| err(StatusCode::BAD_GATEWAY, e))?;

    let content = resp
        .get("stdout")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    Ok(Json(FileContentResponse { path: path.clone(), content }))
}
