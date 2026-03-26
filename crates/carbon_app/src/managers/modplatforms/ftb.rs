use crate::error::request::GoodJsonRequestError;
use reqwest_middleware::ClientWithMiddleware;
use serde::{Deserialize, Serialize};
use tracing::trace;
use url::Url;

/// FTB/Feed The Beast API response wrapper
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FTBResponse<T> {
    pub data: T,
    #[serde(default)]
    pub status: String,
}

/// FTB modpack information
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FTBPack {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub summary: Option<String>,
    pub author: Option<String>,
    pub art: Option<FTBArt>,
    pub tags: Option<Vec<String>>,
    pub plays: Option<i64>,
    pub installs: Option<i64>,
    pub status: Option<String>,
    pub versions: Option<Vec<FTBVersion>>,
}

/// FTB artwork/cover image
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FTBArt {
    pub id: Option<i64>,
    pub url: Option<String>,
    pub thumb_url: Option<String>,
    pub gallery_url: Option<String>,
}

/// FTB version information
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FTBVersion {
    pub id: i64,
    pub name: String,
    pub version: String,
    #[serde(rename = "type")]
    pub type_: Option<String>,
    pub minecraft_version: Option<String>,
    pub java_version: Option<String>,
    pub mod_loader: Option<String>,
    pub mod_loader_version: Option<String>,
    pub updated: Option<i64>,
    pub downloads: Option<i64>,
}

/// FTB search parameters
#[derive(Debug, Clone, Default)]
pub struct FTBSearchParams {
    pub query: Option<String>,
    pub tag: Option<String>,
    pub version: Option<String>,
    pub mod_loader: Option<String>,
    pub offset: Option<u32>,
    pub limit: Option<u32>,
}

pub struct FTB {
    client: ClientWithMiddleware,
    base_url: Url,
}

impl FTB {
    pub fn new(client: ClientWithMiddleware) -> Self {
        Self {
            client,
            base_url: "https://api.modpacks.ch/public".parse().unwrap(),
        }
    }

    /// Get list of all FTB modpacks
    #[tracing::instrument(skip(self))]
    pub async fn get_packs(&self, limit: Option<u32>, offset: Option<u32>) -> anyhow::Result<Vec<FTBPack>> {
        let mut url = self.base_url.join("modpack")?;
        
        let limit = limit.unwrap_or(50);
        let offset = offset.unwrap_or(0);
        url.set_query(Some(&format!("limit={}&offset={}", limit, offset)));
        
        trace!("GET {}", url);
        
        let resp = self
            .client
            .get(url.as_str())
            .send()
            .await?
            .json_with_context_reporting::<FTBResponse<Vec<FTBPack>>>(
                "ftb::get_packs",
            )
            .await?;
        
        Ok(resp.data)
    }

    /// Get a specific modpack by ID
    #[tracing::instrument(skip(self))]
    pub async fn get_pack(&self, pack_id: i64) -> anyhow::Result<FTBPack> {
        let url = self.base_url.join(&format!("modpack/{}", pack_id))?;
        
        trace!("GET {}", url);
        
        let resp = self
            .client
            .get(url.as_str())
            .send()
            .await?
            .json_with_context_reporting::<FTBResponse<FTBPack>>(
                "ftb::get_pack",
            )
            .await?;
        
        Ok(resp.data)
    }

    /// Search for modpacks
    #[tracing::instrument(skip(self))]
    pub async fn search(&self, params: FTBSearchParams) -> anyhow::Result<Vec<FTBPack>> {
        let mut url = self.base_url.join("modpack/search")?;
        
        let mut query_parts = vec![];
        if let Some(q) = &params.query {
            query_parts.push(format!("term={}", urlencoding::encode(q)));
        }
        if let Some(tag) = &params.tag {
            query_parts.push(format!("tag={}", tag));
        }
        query_parts.push(format!("limit={}", params.limit.unwrap_or(50)));
        query_parts.push(format!("offset={}", params.offset.unwrap_or(0)));
        
        url.set_query(Some(&query_parts.join("&")));
        
        trace!("GET {}", url);
        
        let resp = self
            .client
            .get(url.as_str())
            .send()
            .await?
            .json_with_context_reporting::<FTBResponse<Vec<FTBPack>>>(
                "ftb::search",
            )
            .await?;
        
        Ok(resp.data)
    }

    /// Get versions for a specific pack
    #[tracing::instrument(skip(self))]
    pub async fn get_pack_versions(&self, pack_id: i64) -> anyhow::Result<Vec<FTBVersion>> {
        let pack = self.get_pack(pack_id).await?;
        Ok(pack.versions.unwrap_or_default())
    }

    /// Get available tags for filtering
    #[tracing::instrument(skip(self))]
    pub async fn get_tags(&self) -> anyhow::Result<Vec<String>> {
        let url = self.base_url.join("tag")?;
        
        trace!("GET {}", url);
        
        let resp = self
            .client
            .get(url.as_str())
            .send()
            .await?
            .json_with_context_reporting::<FTBResponse<Vec<String>>>(
                "ftb::get_tags",
            )
            .await?;
        
        Ok(resp.data)
    }
}
