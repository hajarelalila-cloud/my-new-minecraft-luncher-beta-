use crate::error::request::GoodJsonRequestError;
use reqwest_middleware::ClientWithMiddleware;
use serde::{Deserialize, Serialize};
use tracing::trace;
use url::Url;

/// ATLauncher API response wrapper
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ATLauncherResponse<T> {
    pub data: T,
}

/// ATLauncher modpack information
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ATLauncherPack {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub pack_type: Option<String>,
    pub version: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub downloads: Option<i32>,
    pub icon_url: Option<String>,
    pub versions: Option<Vec<ATLauncherVersion>>,
}

/// ATLauncher version information
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ATLauncherVersion {
    pub version: String,
    pub minecraft_version: Option<String>,
    pub java_version: Option<String>,
    pub mod_loader: Option<String>,
    pub mod_loader_version: Option<String>,
    pub downloads: Option<i32>,
}

/// ATLauncher search parameters
#[derive(Debug, Clone, Default)]
pub struct ATLauncherSearchParams {
    pub query: Option<String>,
    pub version: Option<String>,
    pub mod_loader: Option<String>,
    pub page: Option<u32>,
    pub page_size: Option<u32>,
}

pub struct ATLauncher {
    client: ClientWithMiddleware,
    base_url: Url,
}

impl ATLauncher {
    pub fn new(client: ClientWithMiddleware) -> Self {
        Self {
            client,
            base_url: "https://api.atlauncher.com/v1".parse().unwrap(),
        }
    }

    /// Get list of all modpacks
    #[tracing::instrument(skip(self))]
    pub async fn get_packs(&self) -> anyhow::Result<Vec<ATLauncherPack>> {
        let url = self.base_url.join("packs/full")?;
        
        trace!("GET {}", url);
        
        let resp = self
            .client
            .get(url.as_str())
            .send()
            .await?
            .json_with_context_reporting::<ATLauncherResponse<Vec<ATLauncherPack>>>(
                "atlauncher::get_packs",
            )
            .await?;
        
        Ok(resp.data)
    }

    /// Get a specific modpack by ID
    #[tracing::instrument(skip(self))]
    pub async fn get_pack(&self, pack_id: i32) -> anyhow::Result<ATLauncherPack> {
        let url = self.base_url.join(&format!("pack/{}", pack_id))?;
        
        trace!("GET {}", url);
        
        let resp = self
            .client
            .get(url.as_str())
            .send()
            .await?
            .json_with_context_reporting::<ATLauncherResponse<ATLauncherPack>>(
                "atlauncher::get_pack",
            )
            .await?;
        
        Ok(resp.data)
    }

    /// Search for modpacks
    #[tracing::instrument(skip(self))]
    pub async fn search(&self, params: ATLauncherSearchParams) -> anyhow::Result<Vec<ATLauncherPack>> {
        let mut url = self.base_url.join("packs/full")?;
        
        let mut query_parts = vec![];
        if let Some(q) = &params.query {
            query_parts.push(format!("search={}", urlencoding::encode(q)));
        }
        if let Some(v) = &params.version {
            query_parts.push(format!("version={}", v));
        }
        
        if !query_parts.is_empty() {
            url.set_query(Some(&query_parts.join("&")));
        }
        
        trace!("GET {}", url);
        
        let resp = self
            .client
            .get(url.as_str())
            .send()
            .await?
            .json_with_context_reporting::<ATLauncherResponse<Vec<ATLauncherPack>>>(
                "atlauncher::search",
            )
            .await?;
        
        Ok(resp.data)
    }

    /// Get versions for a specific pack
    #[tracing::instrument(skip(self))]
    pub async fn get_pack_versions(&self, pack_id: i32) -> anyhow::Result<Vec<ATLauncherVersion>> {
        let url = self.base_url.join(&format!("pack/{}/versions", pack_id))?;
        
        trace!("GET {}", url);
        
        let resp = self
            .client
            .get(url.as_str())
            .send()
            .await?
            .json_with_context_reporting::<ATLauncherResponse<Vec<ATLauncherVersion>>>(
                "atlauncher::get_pack_versions",
            )
            .await?;
        
        Ok(resp.data)
    }
}
