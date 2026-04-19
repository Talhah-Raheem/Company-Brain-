use std::collections::HashMap;

use axum::{extract::{Query, State}, http::StatusCode, response::Json};
use serde::Serialize;

use crate::{models::ApiError, AppState};

const FILE_INDEX_PATH: &str = "/agent/file-index.json";
const DELETED_PATH: &str = "/agent/deleted-files.json";

async fn read_deleted_list(state: &AppState) -> Vec<String> {
    let raw = state.hd.fs_read(DELETED_PATH).await.unwrap_or_default();
    if raw.is_empty() {
        return Vec::new();
    }
    serde_json::from_str(&raw).unwrap_or_default()
}

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

    let deleted: std::collections::HashSet<String> =
        read_deleted_list(&state).await.into_iter().collect();

    let files = stdout
        .lines()
        .filter(|l| !l.trim().is_empty())
        .filter(|path| !deleted.contains(*path))
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

pub async fn delete_file_handler(
    State(state): State<AppState>,
    Query(params): Query<HashMap<String, String>>,
) -> ApiResult<serde_json::Value> {
    let path = params
        .get("path")
        .ok_or_else(|| err(StatusCode::BAD_REQUEST, "missing path param"))?;

    if !path.starts_with("/uploads/") {
        return Err(err(StatusCode::BAD_REQUEST, "invalid path"));
    }

    // Best-effort: look up document_id and purge from the search index.
    // /uploads/ is a read-only namespace on HD, so we can't fs_delete the file itself —
    // instead we record a tombstone that list_files_handler filters out.
    let filename = path.split('/').next_back().unwrap_or("");
    if !filename.is_empty() {
        if let Ok(raw) = state.hd.fs_read(FILE_INDEX_PATH).await {
            if let Ok(map) = serde_json::from_str::<serde_json::Map<String, serde_json::Value>>(&raw) {
                if let Some(doc_id) = map.get(filename).and_then(|v| v.as_str()) {
                    let _ = state.hd.delete_document(doc_id).await;
                    let mut updated = map;
                    updated.remove(filename);
                    if let Ok(json) = serde_json::to_string(&updated) {
                        let _ = state.hd.fs_write(FILE_INDEX_PATH, &json).await;
                    }
                }
            }
        }
    }

    let mut deleted = read_deleted_list(&state).await;
    if !deleted.iter().any(|p| p == path) {
        deleted.push(path.clone());
    }
    let json = serde_json::to_string(&deleted)
        .map_err(|e| err(StatusCode::INTERNAL_SERVER_ERROR, e))?;
    state
        .hd
        .fs_write(DELETED_PATH, &json)
        .await
        .map_err(|e| err(StatusCode::BAD_GATEWAY, e))?;

    Ok(Json(serde_json::json!({ "ok": true, "path": path })))
}
