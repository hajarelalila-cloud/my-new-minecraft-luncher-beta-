use super::ManagerRef;
use serde::Serialize;

/// Game information for Discord Rich Presence
#[derive(Debug, Clone, Serialize)]
pub struct GameInfo {
    pub instance_name: String,
    pub mc_version: String,
    pub mod_loader: Option<String>,
    pub mod_loader_version: Option<String>,
    #[serde(rename = "isPlaying")]
    pub is_playing: bool,
}

pub(crate) struct RichPresenceManager {}

impl RichPresenceManager {
    pub fn new() -> Self {
        Self {}
    }
}

impl ManagerRef<'_, RichPresenceManager> {
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
