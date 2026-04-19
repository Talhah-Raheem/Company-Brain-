use axum::{extract::State, http::StatusCode, response::Json};
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
