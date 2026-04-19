use axum::{extract::State, http::StatusCode, response::Json};

use crate::{
    models::{ApiError, AuditReport, AuditRequest, Contradiction, DocCluster, SearchRequest},
    AppState,
};

type ApiResult<T> = Result<Json<T>, (StatusCode, Json<ApiError>)>;

fn err(status: StatusCode, msg: impl ToString) -> (StatusCode, Json<ApiError>) {
    (status, Json(ApiError { error: msg.to_string() }))
}

// Minimum similarity score to include a result in the audit
const SCORE_THRESHOLD: f64 = 0.6;

pub async fn audit_handler(
    State(state): State<AppState>,
    Json(req): Json<AuditRequest>,
) -> ApiResult<AuditReport> {
    let query = req.query.trim().to_string();

    // Use vector search — uploaded docs live in the search index, not the filesystem
    let search_resp = state
        .hd
        .search(&SearchRequest { query: query.clone(), limit: Some(20) })
        .await
        .map_err(|e| err(StatusCode::BAD_GATEWAY, e))?;

    // Group results by source document
    let clusters = build_clusters(&search_resp.results, &query);
    let contradictions = detect_contradictions(&query, &clusters);

    Ok(Json(AuditReport { query, clusters, contradictions }))
}

fn snippet_contains_all_query_terms(snippet: &str, query: &str) -> bool {
    let lower = snippet.to_lowercase();
    let mut any = false;
    for word in query.split_whitespace() {
        let token: String = word
            .trim_matches(|c: char| !c.is_alphanumeric())
            .to_lowercase();
        if token.is_empty() {
            continue;
        }
        any = true;
        if !lower.contains(&token) {
            return false;
        }
    }
    any
}

fn build_clusters(results: &[crate::models::SearchResult], query: &str) -> Vec<DocCluster> {
    use std::collections::HashMap;

    let mut map: HashMap<String, Vec<String>> = HashMap::new();

    for result in results {
        let score = result.score.unwrap_or(0.0);
        if score < SCORE_THRESHOLD {
            continue;
        }

        let raw = result.content.trim();
        if !snippet_contains_all_query_terms(raw, query) {
            continue;
        }

        let source = result
            .extra
            .get("page_title")
            .and_then(|v| v.as_str())
            .or_else(|| result.source.as_deref())
            .unwrap_or("unknown")
            .to_string();

        let snippet = if raw.chars().count() > 200 {
            format!("{}…", raw.chars().take(200).collect::<String>())
        } else {
            raw.to_string()
        };
        if !snippet.is_empty() {
            map.entry(source).or_default().push(snippet);
        }
    }

    map.into_iter()
        .map(|(source, snippets)| DocCluster { source, snippets })
        .collect()
}

fn detect_contradictions(term: &str, clusters: &[DocCluster]) -> Vec<Contradiction> {
    let mut contradictions = Vec::new();

    for i in 0..clusters.len() {
        for j in (i + 1)..clusters.len() {
            let a = &clusters[i];
            let b = &clusters[j];

            let Some(snippet_a) = a.snippets.first() else { continue };
            let Some(snippet_b) = b.snippets.first() else { continue };

            if snippets_contradict(snippet_a, snippet_b) {
                contradictions.push(Contradiction {
                    term: term.to_string(),
                    source_a: a.source.clone(),
                    source_b: b.source.clone(),
                    snippet_a: snippet_a.clone(),
                    snippet_b: snippet_b.clone(),
                });
            }
        }
    }

    contradictions
}

/// Jaccard similarity of word sets — below 0.4 means contradictory content.
fn snippets_contradict(a: &str, b: &str) -> bool {
    let words_a: std::collections::HashSet<&str> = a.split_whitespace().collect();
    let words_b: std::collections::HashSet<&str> = b.split_whitespace().collect();

    if words_a.is_empty() || words_b.is_empty() {
        return false;
    }

    let intersection = words_a.intersection(&words_b).count();
    let union = words_a.union(&words_b).count();
    let jaccard = intersection as f64 / union as f64;

    jaccard < 0.4
}
