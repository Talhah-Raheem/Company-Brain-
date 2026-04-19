use std::collections::HashMap;

use axum::{extract::State, http::StatusCode, response::Json};

use crate::{
    models::{ApiError, AuditReport, AuditRequest, Contradiction, DocCluster, SearchRequest},
    AppState,
};

type ApiResult<T> = Result<Json<T>, (StatusCode, Json<ApiError>)>;

fn err(status: StatusCode, msg: impl ToString) -> (StatusCode, Json<ApiError>) {
    (status, Json(ApiError { error: msg.to_string() }))
}

const SCORE_THRESHOLD: f64 = 0.6;
const DISPLAY_SNIPPET_CHARS: usize = 200;

pub async fn audit_handler(
    State(state): State<AppState>,
    Json(req): Json<AuditRequest>,
) -> ApiResult<AuditReport> {
    let query = req.query.trim().to_string();

    let search_resp = state
        .hd
        .search(&SearchRequest { query: query.clone(), limit: Some(20) })
        .await
        .map_err(|e| err(StatusCode::BAD_GATEWAY, e))?;

    let (clusters, full_texts) = build_clusters(&search_resp.results, &query);
    let contradictions = detect_contradictions(&query, &clusters, &full_texts);

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

fn truncate_for_display(raw: &str) -> String {
    if raw.chars().count() > DISPLAY_SNIPPET_CHARS {
        format!("{}…", raw.chars().take(DISPLAY_SNIPPET_CHARS).collect::<String>())
    } else {
        raw.to_string()
    }
}

fn build_clusters(
    results: &[crate::models::SearchResult],
    query: &str,
) -> (Vec<DocCluster>, HashMap<String, Vec<String>>) {
    let mut display: HashMap<String, Vec<String>> = HashMap::new();
    let mut full: HashMap<String, Vec<String>> = HashMap::new();

    for result in results {
        let score = result.score.unwrap_or(0.0);
        if score < SCORE_THRESHOLD {
            continue;
        }

        let raw = result.content.trim();
        if raw.is_empty() || !snippet_contains_all_query_terms(raw, query) {
            continue;
        }

        let source = result
            .extra
            .get("page_title")
            .and_then(|v| v.as_str())
            .or_else(|| result.source.as_deref())
            .unwrap_or("unknown")
            .to_string();

        display.entry(source.clone()).or_default().push(truncate_for_display(raw));
        full.entry(source).or_default().push(raw.to_string());
    }

    let clusters = display
        .into_iter()
        .map(|(source, snippets)| DocCluster { source, snippets })
        .collect();

    (clusters, full)
}

fn detect_contradictions(
    term: &str,
    clusters: &[DocCluster],
    full_texts: &HashMap<String, Vec<String>>,
) -> Vec<Contradiction> {
    let mut contradictions = Vec::new();

    for i in 0..clusters.len() {
        for j in (i + 1)..clusters.len() {
            let a = &clusters[i];
            let b = &clusters[j];

            let empty: Vec<String> = Vec::new();
            let texts_a = full_texts.get(&a.source).unwrap_or(&empty);
            let texts_b = full_texts.get(&b.source).unwrap_or(&empty);

            let mut found: Option<(String, String)> = None;
            'outer: for ta in texts_a {
                for tb in texts_b {
                    if let Some(pair) = find_contradiction(ta, tb) {
                        found = Some(pair);
                        break 'outer;
                    }
                }
            }

            if let Some((snippet_a, snippet_b)) = found {
                contradictions.push(Contradiction {
                    term: term.to_string(),
                    source_a: a.source.clone(),
                    source_b: b.source.clone(),
                    snippet_a,
                    snippet_b,
                });
            }
        }
    }

    contradictions
}

fn jaccard(a_words: &std::collections::HashSet<&str>, b_words: &std::collections::HashSet<&str>) -> f64 {
    if a_words.is_empty() || b_words.is_empty() {
        return 0.0;
    }
    let inter = a_words.intersection(b_words).count() as f64;
    let uni = a_words.union(b_words).count() as f64;
    inter / uni
}

fn find_contradiction(a: &str, b: &str) -> Option<(String, String)> {
    let words_a: std::collections::HashSet<&str> = a.split_whitespace().collect();
    let words_b: std::collections::HashSet<&str> = b.split_whitespace().collect();
    let j = jaccard(&words_a, &words_b);

    if j < 0.4 {
        return Some((truncate_for_display(a), truncate_for_display(b)));
    }

    if j > 0.5 && j < 1.0 {
        return find_differing_line_pair(a, b);
    }

    None
}

fn find_differing_line_pair(a: &str, b: &str) -> Option<(String, String)> {
    let lines_a: Vec<&str> = a.lines().map(str::trim).filter(|l| l.len() > 10).collect();
    let lines_b: Vec<&str> = b.lines().map(str::trim).filter(|l| l.len() > 10).collect();

    let set_a: std::collections::HashSet<&str> = lines_a.iter().copied().collect();
    let set_b: std::collections::HashSet<&str> = lines_b.iter().copied().collect();

    let unique_a: Vec<&str> = lines_a.iter().copied().filter(|l| !set_b.contains(l)).collect();
    let unique_b: Vec<&str> = lines_b.iter().copied().filter(|l| !set_a.contains(l)).collect();

    let mut best: Option<(&str, &str, f64)> = None;
    for la in &unique_a {
        let words_la: std::collections::HashSet<&str> = la.split_whitespace().collect();
        for lb in &unique_b {
            let words_lb: std::collections::HashSet<&str> = lb.split_whitespace().collect();
            if words_la.is_empty() || words_lb.is_empty() {
                continue;
            }
            let j = jaccard(&words_la, &words_lb);
            if j < 0.25 || j >= 1.0 {
                continue;
            }
            let max_len = words_la.len().max(words_lb.len()) as f64;
            let diff_frac = words_la.symmetric_difference(&words_lb).count() as f64 / max_len;
            if best.map_or(true, |(_, _, prev)| diff_frac > prev) {
                best = Some((la, lb, diff_frac));
            }
        }
    }

    best.map(|(la, lb, _)| (la.to_string(), lb.to_string()))
}
