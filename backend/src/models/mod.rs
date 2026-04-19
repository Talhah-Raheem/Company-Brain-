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

// ── Pollution types ───────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum PatternType {
    Ssn,
    Email,
    CreditCard,
    Phone,
    /// Generic API key or secret token — always forces Toxic severity
    ApiKey,
    /// AWS access key ID — always forces Toxic severity
    AwsKey,
}

impl PatternType {
    pub fn is_secret(&self) -> bool {
        matches!(self, PatternType::ApiKey | PatternType::AwsKey)
    }

    pub fn label(&self) -> &'static str {
        match self {
            PatternType::Ssn => "Social Security Number",
            PatternType::Email => "Email Address",
            PatternType::CreditCard => "Credit Card Number",
            PatternType::Phone => "Phone Number",
            PatternType::ApiKey => "API Key / Secret",
            PatternType::AwsKey => "AWS Access Key",
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PollutionMatch {
    pub pattern_type: PatternType,
    /// Redacted representation — never contains the raw sensitive value
    pub snippet: String,
    pub char_offset: usize,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum Severity {
    /// No matches found
    Clean,
    /// 1–2 PII matches, no secrets
    Murky,
    /// 3+ matches OR any secret key found
    Toxic,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PollutionReport {
    pub matches: Vec<PollutionMatch>,
    pub severity: Severity,
    pub match_count: usize,
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
