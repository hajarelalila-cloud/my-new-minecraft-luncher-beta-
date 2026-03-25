use super::ManagerRef;
use serde::Serialize;

/// Comprehensive game information for Discord Rich Presence
#[derive(Debug, Clone, Serialize)]
pub struct GameInfo {
    /// Name of the instance
    pub instance_name: String,
    /// Unique instance identifier
    pub instance_id: String,
    /// Minecraft version (e.g., "1.20.1")
    pub mc_version: String,
    /// Modloader type (e.g., "Forge", "Fabric", "Quilt", "NeoForge")
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mod_loader: Option<String>,
    /// Modloader version
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mod_loader_version: Option<String>,
    /// Number of mods installed
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mod_count: Option<usize>,
    /// Modpack name if playing a modpack
    #[serde(skip_serializing_if = "Option::is_none")]
    pub modpack_name: Option<String>,
    /// Modpack icon key for Discord
    #[serde(skip_serializing_if = "Option::is_none")]
    pub modpack_icon: Option<String>,
    /// Modpack version
    #[serde(skip_serializing_if = "Option::is_none")]
    pub modpack_version: Option<String>,
    /// Whether currently playing
    pub is_playing: bool,
    /// Whether in multiplayer mode
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_multiplayer: Option<bool>,
    /// Server IP address
    #[serde(skip_serializing_if = "Option::is_none")]
    pub server_ip: Option<String>,
    /// Server port
    #[serde(skip_serializing_if = "Option::is_none")]
    pub server_port: Option<u16>,
    /// Max players on server
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_players: Option<u32>,
    /// Current players on server
    #[serde(skip_serializing_if = "Option::is_none")]
    pub current_players: Option<u32>,
    /// Allocated memory in MB
    #[serde(skip_serializing_if = "Option::is_none")]
    pub memory_allocated: Option<u16>,
}

/// Download information for Discord Rich Presence
#[derive(Debug, Clone, Serialize)]
pub struct DownloadInfo {
    /// Type of download
    #[serde(rename = "type")]
    pub download_type: String,
    /// Name of what's being downloaded
    pub name: String,
    /// Progress percentage (0-100)
    pub progress: u8,
    /// Download speed
    #[serde(skip_serializing_if = "Option::is_none")]
    pub speed: Option<String>,
    /// Estimated time remaining
    #[serde(skip_serializing_if = "Option::is_none")]
    pub eta: Option<String>,
}

/// Installation information for Discord Rich Presence
#[derive(Debug, Clone, Serialize)]
pub struct InstallInfo {
    /// Type of installation
    #[serde(rename = "type")]
    pub install_type: String,
    /// Name of what's being installed
    pub name: String,
}

pub(crate) struct RichPresenceManager {}

impl RichPresenceManager {
    pub fn new() -> Self {
        Self {}
    }
}

impl ManagerRef<'_, RichPresenceManager> {
    /// Start Discord Rich Presence
    pub async fn start_presence(&self) -> anyhow::Result<()> {
        if self
            .app
            .settings_manager()
            .get_settings()
            .await?
            .discord_integration
        {
            println!("_DRPC_:INIT");
        }

        Ok(())
    }

    /// Stop Discord Rich Presence
    pub async fn stop_presence(&self) -> anyhow::Result<()> {
        if self
            .app
            .settings_manager()
            .get_settings()
            .await?
            .discord_integration
        {
            println!("_DRPC_:SHUTDOWN");
        }

        Ok(())
    }

    /// Update activity with a simple state string
    pub async fn update_activity(&self, state: String) -> anyhow::Result<()> {
        if self
            .app
            .settings_manager()
            .get_settings()
            .await?
            .discord_integration
        {
            println!("_DRPC_:UPDATE_ACTIVITY|{state}");
        }

        Ok(())
    }

    /// Set browsing presence
    pub async fn set_browsing(&self) -> anyhow::Result<()> {
        if self
            .app
            .settings_manager()
            .get_settings()
            .await?
            .discord_integration
        {
            println!("_DRPC_:UPDATE_ACTIVITY|browsing");
        }

        Ok(())
    }

    /// Set downloading presence with progress
    pub async fn set_downloading(&self, info: &DownloadInfo) -> anyhow::Result<()> {
        if self
            .app
            .settings_manager()
            .get_settings()
            .await?
            .discord_integration
        {
            let json = serde_json::to_string(info)?;
            println!("_DRPC_:UPDATE_ACTIVITY|downloading:{json}");
        }

        Ok(())
    }

    /// Set installing presence
    pub async fn set_installing(&self, info: &InstallInfo) -> anyhow::Result<()> {
        if self
            .app
            .settings_manager()
            .get_settings()
            .await?
            .discord_integration
        {
            let json = serde_json::to_string(info)?;
            println!("_DRPC_:UPDATE_ACTIVITY|installing:{json}");
        }

        Ok(())
    }

    /// Set launching presence
    pub async fn set_launching(&self, game_info: &GameInfo) -> anyhow::Result<()> {
        if self
            .app
            .settings_manager()
            .get_settings()
            .await?
            .discord_integration
        {
            let json = serde_json::to_string(game_info)?;
            println!("_DRPC_:UPDATE_ACTIVITY|launching:{json}");
        }

        Ok(())
    }

    /// Update Discord presence with detailed game information
    pub async fn update_game_presence(&self, game_info: &GameInfo) -> anyhow::Result<()> {
        if self
            .app
            .settings_manager()
            .get_settings()
            .await?
            .discord_integration
        {
            let json = serde_json::to_string(game_info)?;
            println!("_DRPC_:UPDATE_ACTIVITY|playing:{json}");
        }

        Ok(())
    }

    /// Stop/clear activity
    pub async fn stop_activity(&self) -> anyhow::Result<()> {
        if self
            .app
            .settings_manager()
            .get_settings()
            .await?
            .discord_integration
        {
            println!("_DRPC_:STOP_ACTIVITY");
        }

        Ok(())
    }
}
