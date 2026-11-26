//! The pod's shared deck shelf. Any member can save a deck under their own
//! name and everyone can list and play every deck. Decks are stored as one JSON
//! file each in `MANABREW_POD_DECKS_DIR`; the deck body is the client's own
//! `Deck` JSON and is kept as-is. Saving or removing needs a member key
//! (`x-club-key`), and a member can only overwrite or remove their own decks.

use std::path::PathBuf;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use axum::extract::{Path, State};
use axum::http::{HeaderMap, StatusCode};
use axum::routing::{get, put};
use axum::{Json, Router};
use serde_json::{json, Value};

use crate::state::ServerState;

#[derive(Clone)]
pub struct PodDeckShelf {
    dir: PathBuf,
    state: Arc<ServerState>,
}

pub fn router(dir: PathBuf, state: Arc<ServerState>) -> Router {
    if let Err(e) = std::fs::create_dir_all(&dir) {
        tracing::error!("[pod-decks] cannot create {}: {}", dir.display(), e);
    }
    Router::new()
        .route("/pod-api/decks", get(list_decks))
        .route("/pod-api/decks/:id", put(save_deck).delete(remove_deck))
        .with_state(PodDeckShelf { dir, state })
}

/// Ids become file names, so only short lowercase slugs are accepted.
pub fn valid_id(id: &str) -> bool {
    !id.is_empty()
        && id.len() <= 80
        && id
            .bytes()
            .all(|b| b.is_ascii_lowercase() || b.is_ascii_digit() || b == b'-')
}

fn member(shelf: &PodDeckShelf, headers: &HeaderMap) -> Result<String, (StatusCode, Json<Value>)> {
    headers
        .get("x-club-key")
        .and_then(|v| v.to_str().ok())
        .and_then(|key| shelf.state.member_for_key(key))
        .ok_or_else(|| {
            (
                StatusCode::UNAUTHORIZED,
                Json(json!({ "error": "Sign in with your member password to share decks." })),
            )
        })
}

fn read_record(path: &std::path::Path) -> Option<Value> {
    let text = std::fs::read_to_string(path).ok()?;
    serde_json::from_str(&text).ok()
}

async fn list_decks(State(shelf): State<PodDeckShelf>) -> Json<Value> {
    let mut decks: Vec<Value> = Vec::new();
    if let Ok(entries) = std::fs::read_dir(&shelf.dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) == Some("json") {
                if let Some(record) = read_record(&path) {
                    decks.push(record);
                }
            }
        }
    }
    decks.sort_by(|a, b| {
        let key = |v: &Value| v["savedAt"].as_u64().unwrap_or(0);
        key(b).cmp(&key(a))
    });
    Json(Value::Array(decks))
}

async fn save_deck(
    State(shelf): State<PodDeckShelf>,
    Path(id): Path<String>,
    headers: HeaderMap,
    Json(body): Json<Value>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let owner = member(&shelf, &headers)?;
    if !valid_id(&id) || !body["deck"].is_object() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "Bad deck." })),
        ));
    }
    let path = shelf.dir.join(format!("{id}.json"));
    if let Some(existing) = read_record(&path) {
        if existing["owner"].as_str() != Some(owner.as_str()) {
            return Err((
                StatusCode::FORBIDDEN,
                Json(json!({ "error": "That deck belongs to someone else." })),
            ));
        }
    }
    let saved_at = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0);
    let record = json!({ "id": id, "owner": owner, "savedAt": saved_at, "deck": body["deck"] });
    let tmp = shelf.dir.join(format!("{id}.json.tmp"));
    let write = std::fs::write(&tmp, record.to_string()).and_then(|_| std::fs::rename(&tmp, &path));
    if let Err(e) = write {
        tracing::error!("[pod-decks] cannot save {}: {}", path.display(), e);
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Could not save the deck." })),
        ));
    }
    tracing::info!("[pod-decks] '{}' saved '{}'", owner, id);
    Ok(Json(record))
}

async fn remove_deck(
    State(shelf): State<PodDeckShelf>,
    Path(id): Path<String>,
    headers: HeaderMap,
) -> Result<StatusCode, (StatusCode, Json<Value>)> {
    let owner = member(&shelf, &headers)?;
    if !valid_id(&id) {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "Bad deck id." })),
        ));
    }
    let path = shelf.dir.join(format!("{id}.json"));
    match read_record(&path) {
        None => Ok(StatusCode::NO_CONTENT),
        Some(existing) if existing["owner"].as_str() == Some(owner.as_str()) => {
            let _ = std::fs::remove_file(&path);
            tracing::info!("[pod-decks] '{}' removed '{}'", owner, id);
            Ok(StatusCode::NO_CONTENT)
        }
        Some(_) => Err((
            StatusCode::FORBIDDEN,
            Json(json!({ "error": "That deck belongs to someone else." })),
        )),
    }
}

#[cfg(test)]
mod tests {
    use super::valid_id;

    #[test]
    fn ids_are_safe_file_names() {
        assert!(valid_id("tal-zada-1"));
        assert!(!valid_id(""));
        assert!(!valid_id("../secrets"));
        assert!(!valid_id("Tal"));
    }
}
