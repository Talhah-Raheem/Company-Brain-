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
        .upload_document(filename, content_type, bytes)
        .await
        .map_err(|e| err(StatusCode::BAD_GATEWAY, e))?;

    let document_id = result
        .get("id")
        .or_else(|| result.get("document_id"))
        .and_then(|v| v.as_str())
        .map(str::to_string);

    Ok(Json(IngestResponse {
        report,
        forwarded: true,
        document_id,
        index_id: None,
    }))
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
