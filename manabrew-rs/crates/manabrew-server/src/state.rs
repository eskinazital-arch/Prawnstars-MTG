use dashmap::DashMap;
use std::sync::Mutex;
use std::time::Instant;
use tokio::sync::mpsc;
use tokio_tungstenite::tungstenite::Message;

use crate::analytics::AnalyticsHandle;
use crate::chat::ChatHistory;
use crate::client_build::ClientBuild;
use crate::identity::{IdentityVerifier, SessionIdentity};
use crate::matchmaking::MatchQueue;
use crate::protocol::identity_token::GUEST_SUBJECT_PREFIX;
use crate::protocol::LocalGameKind;
use crate::room::Room;
use crate::seal::MessageSealer;

pub struct ConnectedPlayer {
    pub player_id: String,
    pub username: String,
    pub room_id: Option<String>,
    pub sender: mpsc::UnboundedSender<Message>,
    /// Most recent heartbeat round trip for this connection. The aggregate
    /// histogram cannot answer whether one slow decision sat behind one bad
    /// link, because it drops the association at the moment it records.
    pub last_client_rtt_ms: Option<u32>,
    pub connected: bool,
    pub generation: u64,
    pub last_seen: Instant,
    pub disconnected_at: Option<Instant>,
    pub is_service: bool,
    pub identity: Vec<SessionIdentity>,
    pub name_verified: bool,
    pub qualification: Option<String>,
    pub avatar_url: Option<String>,
    /// What the client reported at authentication. Read when deciding which
    /// wire features this seat can be sent.
    pub client: ClientBuild,
    /// Playing on their own machine, reported by the client. Only meaningful
    /// while `connected`: a dropped socket stops asserting anything.
    pub local_game: Option<LocalGameKind>,
    pub last_chat_at: Option<Instant>,
    pub client_ip: String,
    pub seal: Option<String>,
}

impl ConnectedPlayer {
    pub fn verified(&self) -> bool {
        self.name_verified
            && self.identity.iter().any(|identity| {
                matches!(identity, SessionIdentity::Account(sub) if !sub.starts_with(GUEST_SUBJECT_PREFIX))
            })
    }
}

pub struct UsernameSession {
    pub player_id: String,
    pub room_id: Option<String>,
    pub generation: u64,
    pub connected: bool,
    pub sender_closed: bool,
    pub identity: Vec<SessionIdentity>,
    pub name_verified: bool,
}

impl From<&ConnectedPlayer> for UsernameSession {
    fn from(player: &ConnectedPlayer) -> Self {
        UsernameSession {
            player_id: player.player_id.clone(),
            room_id: player.room_id.clone(),
            generation: player.generation,
            connected: player.connected,
            sender_closed: player.sender.is_closed(),
            identity: player.identity.clone(),
            name_verified: player.name_verified,
        }
    }
}

pub struct ServerState {
    pub players: DashMap<String, ConnectedPlayer>,
    pub rooms: DashMap<String, Room>,
    pub server_key: String,
    pub max_rooms: usize,
    pub official_key: Option<String>,
    pub analytics: AnalyticsHandle,
    pub identity: IdentityVerifier,
    /// See `ServerConfig::direct_transport`. Fails closed.
    pub direct_transport: bool,
    /// See `ServerConfig::guest_lobby_chat`. Off unless configured.
    pub guest_lobby_chat: bool,
    /// See `ServerConfig::member_keys`: lowercase key to member name.
    pub member_keys: Vec<(String, String)>,
    /// See `ServerConfig::ice_servers`.
    pub ice_servers: Vec<crate::protocol::IceServer>,
    pub lobby_chat: Mutex<ChatHistory>,
    pub seal: Option<MessageSealer>,
    pub art_base_url: Option<String>,
    pub queue: Mutex<MatchQueue>,
}

/// Splits a client name into its base and its `@1234` tag, if it has one.
/// The web client tags every guest name so two browsers never collide.
pub fn split_name_tag(name: &str) -> (&str, &str) {
    if let Some(at) = name.rfind('@') {
        let tag = &name[at + 1..];
        if tag.len() == 4 && tag.bytes().all(|b| b.is_ascii_digit()) {
            return (&name[..at], &name[at..]);
        }
    }
    (name, "")
}

impl ServerState {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        server_key: String,
        max_rooms: usize,
        official_key: Option<String>,
        analytics: AnalyticsHandle,
        hub_jwks_url: Option<String>,
        seal: Option<MessageSealer>,
    ) -> Self {
        ServerState {
            players: DashMap::new(),
            rooms: DashMap::new(),
            server_key,
            max_rooms,
            official_key,
            analytics,
            identity: IdentityVerifier::new(hub_jwks_url),
            direct_transport: false,
            guest_lobby_chat: false,
            member_keys: Vec::new(),
            ice_servers: Vec::new(),
            lobby_chat: Mutex::new(ChatHistory::default()),
            seal,
            art_base_url: None,
            queue: Mutex::new(MatchQueue::default()),
        }
    }

    pub fn with_member_keys(mut self, keys: Vec<(String, String)>) -> Self {
        self.member_keys = keys;
        self
    }

    /// The member a password belongs to, if it is a member key.
    pub fn member_for_key(&self, password: &str) -> Option<String> {
        let wanted = password.trim().to_lowercase();
        self.member_keys
            .iter()
            .find(|(key, _)| *key == wanted)
            .map(|(_, name)| name.clone())
    }

    /// Whether a username (with or without its `@1234` tag) is reserved for a member.
    pub fn is_member_name(&self, username: &str) -> bool {
        let wanted = split_name_tag(username.trim()).0;
        self.member_keys
            .iter()
            .any(|(_, name)| name.eq_ignore_ascii_case(wanted))
    }

    pub fn with_guest_lobby_chat(mut self, enabled: bool) -> Self {
        self.guest_lobby_chat = enabled;
        self
    }

    pub fn with_direct_transport(
        mut self,
        enabled: bool,
        ice_servers: Vec<crate::protocol::IceServer>,
    ) -> Self {
        self.direct_transport = enabled;
        self.ice_servers = ice_servers;
        self
    }

    /// Where this relay serves card art, handed to every client at auth. A
    /// self-hosted box holding the images is the reason to run one, and the
    /// client cannot guess the port.
    pub fn with_art_base_url(mut self, url: Option<String>) -> Self {
        self.art_base_url = url;
        self
    }

    pub fn session_by_username(&self, username: &str) -> Option<UsernameSession> {
        let mut connected = None;
        for entry in self.players.iter() {
            let player = entry.value();
            if player.username != username {
                continue;
            }
            if !player.connected {
                return Some(UsernameSession::from(player));
            }
            connected.get_or_insert_with(|| UsernameSession::from(player));
        }
        connected
    }
}

#[cfg(test)]
mod member_key_tests {
    use super::split_name_tag;
    use crate::config::parse_member_keys;

    #[test]
    fn splits_only_four_digit_tags() {
        assert_eq!(split_name_tag("Cuckold Tal@1234"), ("Cuckold Tal", "@1234"));
        assert_eq!(split_name_tag("Cuckold Tal"), ("Cuckold Tal", ""));
        assert_eq!(split_name_tag("a@b.com"), ("a@b.com", ""));
    }

    #[test]
    fn parses_member_keys() {
        let keys = parse_member_keys(" CUCK-Tal=Cuckold Tal, bad, =x,cuck-eden=Cuckold Eden");
        assert_eq!(
            keys,
            vec![
                ("cuck-tal".to_string(), "Cuckold Tal".to_string()),
                ("cuck-eden".to_string(), "Cuckold Eden".to_string()),
            ]
        );
    }
}
