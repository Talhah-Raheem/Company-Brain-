use axum::{
    body::{to_bytes, Body},
    extract::{FromRequest, Multipart, Request, State},
    http::{HeaderMap, StatusCode},
    response::Json,
};

use crate::{
    models::{ApiError, IngestResponse, PollutionReport, Severity, UrlIngestRequest},
    pollution::scanner,
    AppState,
};

const FILE_INDEX_PATH: &str = "/agent/file-index.json";

type ApiResult<T> = Result<Json<T>, (StatusCode, Json<ApiError>)>;

fn err(status: StatusCode, msg: impl ToString) -> (StatusCode, Json<ApiError>) {
    (status, Json(ApiError { error: msg.to_string() }))
}

fn clean_report() -> PollutionReport {
    PollutionReport {
        matches: vec![],
        severity: Severity::Clean,
        match_count: 0,
    }
}

pub async fn ingest_handler(
    State(state): State<AppState>,
    headers: HeaderMap,
    request: Request<Body>,
) -> ApiResult<IngestResponse> {
    let content_type = headers
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_lowercase();

    if content_type.contains("multipart/form-data") {
        handle_file(State(state), request).await
    } else {
        handle_url(State(state), request).await
    }
}

async fn handle_file(
    State(state): State<AppState>,
    request: Request<Body>,
) -> ApiResult<IngestResponse> {
    let mut multipart = Multipart::from_request(request, &())
        .await
        .map_err(|e| err(StatusCode::BAD_REQUEST, e))?;

    // Pull the first field (the file)
    let field = multipart
        .next_field()
        .await
        .map_err(|e| err(StatusCode::BAD_REQUEST, e))?
        .ok_or_else(|| err(StatusCode::BAD_REQUEST, "no file field in multipart body"))?;

    let filename = field.file_name().unwrap_or("upload").to_string();
    let content_type = field
        .content_type()
        .unwrap_or("application/octet-stream")
        .to_string();
    let bytes = field
        .bytes()
        .await
        .map_err(|e| err(StatusCode::BAD_REQUEST, e))?
        .to_vec();

    // Scan text content; binary files (PDF, images) skip scanning
    let report = match String::from_utf8(bytes.clone()) {
        Ok(text) => scanner::scan(&text),
        Err(_) => clean_report(), // binary — can't pre-scan, forward as-is
    };

    if report.severity == Severity::Toxic {
        return Ok(Json(IngestResponse {
            report,
            forwarded: false,
            document_id: None,
            index_id: None,
        }));
    }

    let result = state
        .hd
        .upload_document(filename.clone(), content_type, bytes)
        .await
        .map_err(|e| err(StatusCode::BAD_GATEWAY, e))?;

    let document_id = result
        .get("id")
        .or_else(|| result.get("document_id"))
        .and_then(|v| v.as_str())
        .map(str::to_string);

    // Best-effort: persist filename → document_id so delete can purge the search index
    if let Some(ref doc_id) = document_id {
        let _ = record_document_id(&state, &filename, doc_id).await;
    }

    Ok(Json(IngestResponse {
        report,
        forwarded: true,
        document_id,
        index_id: None,
    }))
}

/// Reads /agent/file-index.json, adds/updates filename → doc_id, writes back.
async fn record_document_id(state: &AppState, filename: &str, doc_id: &str) -> Result<(), ()> {
    let raw = state.hd.fs_read(FILE_INDEX_PATH).await.unwrap_or_default();
    let mut map: serde_json::Map<String, serde_json::Value> = if raw.is_empty() {
        serde_json::Map::new()
    } else {
        serde_json::from_str(&raw).unwrap_or_default()
    };
    map.insert(filename.to_string(), serde_json::Value::String(doc_id.to_string()));
    let json = serde_json::to_string(&map).map_err(|_| ())?;
    state.hd.fs_write(FILE_INDEX_PATH, &json).await.map_err(|_| ())?;
    Ok(())
}

async fn handle_url(
    State(state): State<AppState>,
    request: Request<Body>,
) -> ApiResult<IngestResponse> {
    let body_bytes = to_bytes(request.into_body(), 1024 * 1024)
        .await
        .map_err(|e| err(StatusCode::BAD_REQUEST, e))?;

    let req: UrlIngestRequest = serde_json::from_slice(&body_bytes)
        .map_err(|e| err(StatusCode::BAD_REQUEST, format!("invalid JSON: {e}")))?;

    // URLs can't be pre-scanned — always forward per spec
    let index = state
        .hd
        .crawl_index(&req.url)
        .await
        .map_err(|e| err(StatusCode::BAD_GATEWAY, e))?;

    Ok(Json(IngestResponse {
        report: clean_report(),
        forwarded: true,
        document_id: None,
        index_id: Some(index.id),
    }))
}
