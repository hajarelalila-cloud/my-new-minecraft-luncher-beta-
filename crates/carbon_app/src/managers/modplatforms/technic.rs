use crate::error::request::GoodJsonRequestError;
use reqwest_middleware::ClientWithMiddleware;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tracing::trace;
use url::Url;

/// Technic Platform API response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TechnicResponse<T> {
    pub modpacks: Option<T>,
    pub modpack: Option<T>,
    #[serde(default)]
    pub total_count: Option<i64>,
}

/// Technic modpack information
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TechnicPack {
    pub name: String,
    pub display_name: Option<String>,
    pub description: Option<String>,
    pub platform: Option<String>,
    pub recommended: Option<String>,
    pub latest: Option<String>,
    pub icon: Option<String>,
    pub icon_md5: Option<String>,
    pub logo: Option<String>,
    pub logo_md5: Option<String>,
    pub background: Option<String>,
    pub background_md5: Option<String>,
    pub downloads: Option<i64>,
    pub runs: Option<i64>,
    pub server_url: Option<String>,
    pub website_url: Option<String>,
    pub versions: Option<Vec<String>>,
    pub builds: Option<Vec<String>>,
    pub tags: Option<Vec<String>>,
    pub user: Option<TechnicUser>,
}

/// Technic user/author info
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TechnicUser {
    pub id: Option<i64>,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub title: Option<String>,
}

/// Technic search result (key = slug, value = pack info)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TechnicSearchResult {
    #[serde(flatten)]
    pub packs: HashMap<String, TechnicPack>,
}

/// Technic search parameters
#[derive(Debug, Clone, Default)]
pub struct TechnicSearchParams {
    pub query: Option<String>,
    pub tag: Option<String>,
    pub page: Option<u32>,
}

pub struct Technic {
    client: ClientWithMiddleware,
    base_url: Url,
}

impl Technic {
    pub fn new(client: ClientWithMiddleware) -> Self {
        Self {
            client,
            base_url: "https://api.technicpack.net".parse().unwrap(),
        }
    }

    /// Search for modpacks on Technic Platform
    #[tracing::instrument(skip(self))]
    pub async fn search(&self, query: &str) -> anyhow::Result<Vec<(String, TechnicPack)>> {
        let mut url = self.base_url.join("search")?;
        url.set_query(Some(&format!("q={}", urlencoding::encode(query))));
        
        trace!("GET {}", url);
        
        let resp = self
            .client
            .get(url.as_str())
            .send()
            .await?
            .json_with_context_reporting::<TechnicResponse<TechnicSearchResult>>(
                "technic::search",
            )
            .await?;
        
        let mut packs = Vec::new();
        if let Some(search_result) = resp.modpacks {
            for (slug, pack) in search_result.packs {
                packs.push((slug, pack));
            }
        }
        
        Ok(packs)
    }

    /// Get a specific modpack by slug
    #[tracing::instrument(skip(self))]
    pub async fn get_pack(&self, slug: &str) -> anyhow::Result<TechnicPack> {
        let url = self.base_url.join(&format!("modpack/{}?build=technic", slug))?;
        
        trace!("GET {}", url);
        
        let resp = self
            .client
            .get(url.as_str())
            .send()
            .await?
            .json_with_context_reporting::<TechnicResponse<TechnicPack>>(
                "technic::get_pack",
            )
            .await?;
        
        let pack = resp.modpack.ok_or_else(|| {
            anyhow::anyhow!("Technic pack '{}' not found", slug)
        })?;
        
        Ok(pack)
    }

    /// Get modpack version/build info
    #[tracing::instrument(skip(self))]
    pub async fn get_pack_build(&self, slug: &str, build: &str) -> anyhow::Result<TechnicPack> {
        let url = self.base_url.join(&format!("modpack/{}?build={}", slug, build))?;
        
        trace!("GET {}", url);
        
        let resp = self
            .client
            .get(url.as_str())
            .send()
            .await?
            .json_with_context_reporting::<TechnicResponse<TechnicPack>>(
                "technic::get_pack_build",
            )
            .await?;
        
        let pack = resp.modpack.ok_or_else(|| {
            anyhow::anyhow!("Technic pack '{}' build '{}' not found", slug, build)
        })?;
        
        Ok(pack)
    }

    /// Get popular modpacks (featured/trending)
    #[tracing::instrument(skip(self))]
    pub async fn get_featured(&self) -> anyhow::Result<Vec<(String, TechnicPack)>> {
        let url = self.base_url.join("trending?build=technic")?;
        
        trace!("GET {}", url);
        
        let resp = self
            .client
            .get(url.as_str())
            .send()
            .await?
            .json_with_context_reporting::<TechnicResponse<TechnicSearchResult>>(
                "technic::get_featured",
            )
            .await?;
        
        let mut packs = Vec::new();
        if let Some(search_result) = resp.modpacks {
            for (slug, pack) in search_result.packs {
                packs.push((slug, pack));
            }
        }
        
        Ok(packs)
    }

    /// Get all modpacks (with pagination)
    #[tracing::instrument(skip(self))]
    pub async fn get_all(&self, page: Option<u32>) -> anyhow::Result<Vec<(String, TechnicPack)>> {
        let page = page.unwrap_or(0);
        let url = self.base_url.join(&format!("modpack?build=technic&page={}", page))?;
        
        trace!("GET {}", url);
        
        let resp = self
            .client
            .get(url.as_str())
            .send()
            .await?
            .json_with_context_reporting::<TechnicResponse<TechnicSearchResult>>(
                "technic::get_all",
            )
            .await?;
        
        let mut packs = Vec::new();
        if let Some(search_result) = resp.modpacks {
            for (slug, pack) in search_result.packs {
                packs.push((slug, pack));
            }
        }
        
        Ok(packs)
    }
}
