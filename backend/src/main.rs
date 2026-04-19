mod api;
mod humandelta;
mod models;
mod pollution;

use std::sync::Arc;

use axum::{extract::State, http::StatusCode, response::Json, routing::{get, post}, Router};
use dotenvy::dotenv;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use humandelta::HumanDeltaClient;
use models::HealthResponse;

#[derive(Clone)]
pub struct AppState {
    pub hd: Arc<HumanDeltaClient>,
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let api_key = std::env::var("HUMAN_DELTA_API_KEY").expect("HUMAN_DELTA_API_KEY must be set");
    let base_url = std::env::var("HUMAN_DELTA_BASE_URL")
        .unwrap_or_else(|_| "https://api.humandelta.ai".to_string());

    let state = AppState {
        hd: Arc::new(HumanDeltaClient::new(base_url, api_key)),
    };

    let cors = CorsLayer::new()
        .allow_origin("http://localhost:3000".parse::<axum::http::HeaderValue>().unwrap())
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(health))
        .route("/api/ingest", post(api::ingest::ingest_handler))
        .route("/api/audit", post(api::audit::audit_handler))
        .route("/api/audit/resolve", post(api::resolve::resolve_handler))
        .route("/api/search", post(api::search::search_handler))
        .route("/api/files", get(api::files::list_files_handler).delete(api::files::delete_file_handler))
        .route("/api/files/content", get(api::files::file_content_handler))
        .route("/api/governance", get(api::governance::governance_handler))
        .with_state(state)
        .layer(cors);

    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let addr = format!("0.0.0.0:{port}");
    tracing::info!("Safety Diver backend listening on {addr}");

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health(_state: State<AppState>) -> (StatusCode, Json<HealthResponse>) {
    (
        StatusCode::OK,
        Json(HealthResponse {
            status: "ok",
            version: env!("CARGO_PKG_VERSION"),
        }),
    )
}
