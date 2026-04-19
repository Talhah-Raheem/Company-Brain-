use serde::{Deserialize, Serialize};

// ── Human Delta passthrough types ─────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct IndexRequest {
    pub url: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IndexResponse {
    pub id: String,
    #[serde(flatten)]
    pub extra: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchRequest {
    pub query: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    pub content: String,
    pub source: Option<String>,
    pub score: Option<f64>,
    #[serde(flatten)]
    pub extra: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResponse {
    pub results: Vec<SearchResult>,
    #[serde(flatten)]
    pub extra: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FsRequest {
    pub command: FsCommand,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pattern: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum FsCommand {
    Ls,
    Tree,
    Cat,
    Grep,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FsResponse {
    pub output: serde_json::Value,
}

// ── API response envelope ─────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct ApiError {
    pub error: String,
}

#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub status: &'static str,
    pub version: &'static str,
}
