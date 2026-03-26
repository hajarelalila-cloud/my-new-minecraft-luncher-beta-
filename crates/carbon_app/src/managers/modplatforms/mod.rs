use crate::{cache_middleware, iridium_client::get_client};

use super::{ManagerRef, UnsafeAppRef};

pub mod atlauncher;
pub mod curseforge;
pub mod ftb;
pub mod modrinth;
pub mod technic;

pub struct ModplatformsManager {
    pub curseforge: curseforge::CurseForge,
    pub modrinth: modrinth::Modrinth,
    pub atlauncher: atlauncher::ATLauncher,
    pub ftb: ftb::FTB,
    pub technic: technic::Technic,
}

impl ModplatformsManager {
    pub fn new(unsafeappref: UnsafeAppRef, nokiatis_base_api: String) -> Self {
        let curseforge_client = cache_middleware::new_client(
            unsafeappref.clone(),
            get_client(nokiatis_base_api.clone()),
        );
        
        Self {
            curseforge: curseforge::CurseForge::new(curseforge_client.clone()),
            modrinth: modrinth::Modrinth::new(curseforge_client.clone()),
            atlauncher: atlauncher::ATLauncher::new(curseforge_client.clone()),
            ftb: ftb::FTB::new(curseforge_client.clone()),
            technic: technic::Technic::new(curseforge_client),
        }
    }
}

impl ManagerRef<'_, ModplatformsManager> {}
