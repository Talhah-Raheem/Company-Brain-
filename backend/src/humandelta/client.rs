use reqwest::{multipart, Client};
use thiserror::Error;

use crate::models::{FsRequest, IndexRequest, IndexResponse, SearchRequest, SearchResponse};

#[derive(Error, Debug)]
pub enum HdError {
    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),
    #[error("Human Delta API error ({status}): {body}")]
    Api { status: u16, body: String },
}

pub struct HumanDeltaClient {
    client: Client,
    base_url: String,
    api_key: String,
}

impl HumanDeltaClient {
    pub fn new(base_url: String, api_key: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
            api_key,
        }
    }

    fn auth_header(&self) -> String {
        format!("Bearer {}", self.api_key)
    }

    async fn check_response(&self, resp: reqwest::Response) -> Result<reqwest::Response, HdError> {
        let status = resp.status();
        if status.is_success() {
            Ok(resp)
        } else {
            let body = resp.text().await.unwrap_or_default();
            Err(HdError::Api {
                status: status.as_u16(),
                body,
            })
        }
    }

    /// POST /v1/indexes — crawl a website (async)
    pub async fn crawl_index(&self, url: &str) -> Result<IndexResponse, HdError> {
        let resp = self
            .client
            .post(format!("{}/v1/indexes", self.base_url))
            .header("Authorization", self.auth_header())
            .json(&IndexRequest {
                source_type: "website".to_string(),
                website: crate::models::IndexWebsite { url: url.to_string() },
            })
            .send()
            .await?;
        Ok(self.check_response(resp).await?.json().await?)
    }

    /// POST /v1/documents — upload a document (multipart)
    pub async fn upload_document(
        &self,
        filename: String,
        content_type: String,
        bytes: Vec<u8>,
    ) -> Result<serde_json::Value, HdError> {
        let part = multipart::Part::bytes(bytes)
            .file_name(filename)
            .mime_str(&content_type)
            .map_err(|e| HdError::Http(e))?;
        let form = multipart::Form::new().part("file", part);

        let resp = self
            .client
            .post(format!("{}/v1/documents", self.base_url))
            .header("Authorization", self.auth_header())
            .multipart(form)
            .send()
            .await?;
        Ok(self.check_response(resp).await?.json().await?)
    }

    /// POST /v1/search — vector search over the corpus
    pub async fn search(&self, req: &SearchRequest) -> Result<SearchResponse, HdError> {
        let resp = self
            .client
            .post(format!("{}/v1/search", self.base_url))
            .header("Authorization", self.auth_header())
            .json(req)
            .send()
            .await?;
        Ok(self.check_response(resp).await?.json().await?)
    }

    /// POST /v1/fs — shell-style FS access (ls, tree, cat, grep)
    pub async fn fs(&self, req: &FsRequest) -> Result<serde_json::Value, HdError> {
        let resp = self
            .client
            .post(format!("{}/v1/fs", self.base_url))
            .header("Authorization", self.auth_header())
            .json(req)
            .send()
            .await?;
        Ok(self.check_response(resp).await?.json().await?)
    }

    /// POST /v1/fs — write content to a path under /agent/
    pub async fn fs_write(&self, path: &str, content: &str) -> Result<serde_json::Value, HdError> {
        let body = serde_json::json!({ "op": "write", "path": path, "content": content });
        let resp = self
            .client
            .post(format!("{}/v1/fs", self.base_url))
            .header("Authorization", self.auth_header())
            .json(&body)
            .send()
            .await?;
        Ok(self.check_response(resp).await?.json().await?)
    }

    /// POST /v1/fs — read content from a path. Strips HD's scope-metadata header line.
    pub async fn fs_read(&self, path: &str) -> Result<String, HdError> {
        let body = serde_json::json!({ "op": "read", "path": path });
        let resp = self
            .client
            .post(format!("{}/v1/fs", self.base_url))
            .header("Authorization", self.auth_header())
            .json(&body)
            .send()
            .await?;
        let val: serde_json::Value = self.check_response(resp).await?.json().await?;

        if val.get("found").and_then(|v| v.as_bool()) == Some(false) {
            return Ok(String::new());
        }

        let raw = val.get("content").and_then(|v| v.as_str()).unwrap_or("");
        // HD prepends: <!-- scope=org pinned=... version=N updated=... -->\n
        let stripped = raw
            .strip_prefix("<!--")
            .and_then(|r| r.split_once("-->"))
            .map(|(_, rest)| rest.trim_start_matches('\n').to_string())
            .unwrap_or_else(|| raw.to_string());
        Ok(stripped)
    }

    /// DELETE /v1/documents/{id} — remove a document from the search index
    pub async fn delete_document(&self, id: &str) -> Result<(), HdError> {
        let resp = self
            .client
            .delete(format!("{}/v1/documents/{id}", self.base_url))
            .header("Authorization", self.auth_header())
            .send()
            .await?;
        self.check_response(resp).await?;
        Ok(())
    }

    /// POST /v1/fs — delete a file at the given path
    pub async fn fs_delete(&self, path: &str) -> Result<serde_json::Value, HdError> {
        let body = serde_json::json!({ "op": "delete", "path": path });
        let resp = self
            .client
            .post(format!("{}/v1/fs", self.base_url))
            .header("Authorization", self.auth_header())
            .json(&body)
            .send()
            .await?;
        Ok(self.check_response(resp).await?.json().await?)
    }

    /// POST /v1/fs with a raw shell command string e.g. "grep refund policy"
    pub async fn fs_cmd(&self, cmd: &str) -> Result<serde_json::Value, HdError> {
        let body = serde_json::json!({ "cmd": cmd });
        let resp = self
            .client
            .post(format!("{}/v1/fs", self.base_url))
            .header("Authorization", self.auth_header())
            .json(&body)
            .send()
            .await?;
        Ok(self.check_response(resp).await?.json().await?)
    }
}
