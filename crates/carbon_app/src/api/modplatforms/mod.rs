use crate::{
    api::{keys::modplatforms::*, router::router},
    managers::App,
};
use carbon_platforms::{
    curseforge::{
        ClassId,
        filters::{ModDescriptionParameters, ModParameters},
    },
    modrinth::project::ProjectType,
};
use curseforge::structs::{CFFEFile, CFFEModLoaderType};
use modrinth::structs::MRFEVersion;
use responses::{
    FEUnifiedCategories, FEUnifiedCategory, FEUnifiedModLoaderType, FEUnifiedModLoaders,
    FEUnifiedPlatform, FEUnifiedSearchType,
};
use rspc::RouterBuilder;
use serde::{Deserialize, Serialize};
use specta::Type;
use strum::IntoEnumIterator;
use strum_macros::EnumIter;
use tracing::info;

mod common;
mod curseforge;
mod filters;
mod modrinth;
mod responses;

pub(super) fn mount() -> RouterBuilder<App> {
    router! {
        // Curseforge
        query CURSEFORGE_SEARCH[app, filters: curseforge::filters::CFFEModSearchParameters] {
            let modplatforms = app.modplatforms_manager();
            let response = modplatforms.curseforge.search(filters.into()).await?;

            Ok(curseforge::responses::FEModSearchResponse::from(response))
        }

        query CURSEFORGE_GET_MOD[app, mod_parameters: curseforge::filters::CFFEModParameters] {
            let modplatforms = app.modplatforms_manager();
            let response = modplatforms.curseforge.get_mod(mod_parameters.into()).await?;

            Ok(curseforge::responses::FEModResponse::from(response))
        }

        query CURSEFORGE_GET_MODS[app, mod_parameters: curseforge::filters::CFFEModsParameters] {
            let modplatforms = app.modplatforms_manager();
            let response = modplatforms.curseforge.get_mods(mod_parameters.into()).await?;

            Ok(curseforge::responses::FEModsResponse::from(response))
        }

        query CURSEFORGE_GET_MOD_DESCRIPTION[app, mod_parameters: curseforge::filters::CFFEModDescriptionParameters] {
            let modplatforms = app.modplatforms_manager();
            let response = modplatforms.curseforge.get_mod_description(mod_parameters.into()).await?;

            Ok(curseforge::responses::FEModDescriptionResponse::from(response))
        }

        query CURSEFORGE_GET_MOD_FILE[app, mod_parameters: curseforge::filters::CFFEModFileParameters] {
            let modplatforms = app.modplatforms_manager();
            let response = modplatforms.curseforge.get_mod_file(mod_parameters.into()).await?;

            Ok(curseforge::responses::FEModFileResponse::from(response))
        }

        query CURSEFORGE_GET_MOD_FILES[app, mod_parameters: curseforge::filters::CFFEModFilesParameters] {
            let modplatforms = app.modplatforms_manager();
            let response = modplatforms.curseforge.get_mod_files(mod_parameters.into()).await?;

            Ok(curseforge::responses::FEModFilesResponse::from(response))
        }

        query CURSEFORGE_GET_FILES[app, mod_parameters: curseforge::filters::CFFEFilesParameters] {
            let modplatforms = app.modplatforms_manager();
            let response = modplatforms.curseforge.get_files(mod_parameters.into()).await?;

            Ok(curseforge::responses::FEFilesResponse::from(response))
        }

        query CURSEFORGE_GET_MOD_FILE_CHANGELOG[app, mod_parameters: curseforge::filters::CFFEModFileChangelogParameters] {
            let modplatforms = app.modplatforms_manager();
            let response = modplatforms.curseforge.get_mod_file_changelog(mod_parameters.into()).await?;

            Ok(curseforge::responses::FEModFileChangelogResponse::from(response))
        }

        // Modrinth
        query MODRINTH_SEARCH[app, search_params: modrinth::filters::MRFEProjectSearchParameters] {
            let modplatforms = app.modplatforms_manager();
            let response = modplatforms.modrinth.search(search_params.into()).await?;

            Ok(modrinth::responses::MRFEProjectSearchResponse::from(response))

        }

        query MODRINTH_GET_PROJECT[app, project: modrinth::filters::MRFEProjectID  ] {
            let modplatforms = app.modplatforms_manager();
            let response = modplatforms.modrinth.get_project(project.into()).await?;

            Ok(modrinth::structs::MRFEProject::from(response))
        }

        query MODRINTH_GET_PROJECTS[app, projects: modrinth::filters::MRFEProjectIDs] {
            let modplatforms = app.modplatforms_manager();
            let response = modplatforms.modrinth.get_projects(projects.into()).await?;

            Ok(modrinth::responses::MRFEProjectsResponse::from(response))
        }

        query MODRINTH_GET_PROJECT_VERSIONS[app, filters: modrinth::filters::MRFEProjectVersionsFilters] {
            let modplatforms = app.modplatforms_manager();
            let response = modplatforms.modrinth.get_project_versions(filters.into()).await?;

            Ok(modrinth::responses::MRFEVersionsResponse::from(response))
        }

        query MODRINTH_GET_VERSION[app, version: modrinth::filters::MRFEVersionID] {
            let modplatforms = app.modplatforms_manager();
            let response = modplatforms.modrinth.get_version(version.into()).await?;

            Ok(modrinth::structs::MRFEVersion::from(response))
        }

        query MODRINTH_GET_VERSIONS[app, versions: modrinth::filters::MRFEVersionIDs] {
            let modplatforms = app.modplatforms_manager();
            let response = modplatforms.modrinth.get_versions(versions.into()).await?;

            Ok(modrinth::responses::MRFEVersionsResponse::from(response))
        }

        query MODRINTH_GET_PROJECT_TEAM[app, project: modrinth::filters::MRFEProjectID] {
            let modplatforms = app.modplatforms_manager();
            let response = modplatforms.modrinth.get_project_team(project.into()).await?;

            Ok(modrinth::responses::MRFETeamResponse::from(response))
        }

        query MODRINTH_GET_TEAM[app, team: modrinth::filters::MRFETeamID] {
            let modplatforms = app.modplatforms_manager();
            let response = modplatforms.modrinth.get_team(team.into()).await?;

            Ok(modrinth::responses::MRFETeamResponse::from(response))
        }

        query UNIFIED_SEARCH[app, search_params: filters::FEUnifiedSearchParameters] {
            match search_params.search_api {
                Some(FEUnifiedPlatform::Curseforge) => {
                    let modplatforms = app.modplatforms_manager();
                    match modplatforms.curseforge.search(search_params.clone().into()).await {
                        Ok(curseforge_response) => Ok(responses::FEUnifiedSearchResponse::from(curseforge_response)),
                        Err(e) => {
                            // Log the error but return empty results instead of failing
                            tracing::warn!("CurseForge search failed: {}. Returning empty results.", e);
                            Ok(responses::FEUnifiedSearchResponse {
                                data: vec![],
                                pagination: Some(responses::FEUnifiedPagination {
                                    index: 0,
                                    page_size: search_params.page_size.unwrap_or(40) as u32,
                                    result_count: 0,
                                    total_count: 0,
                                }),
                            })
                        }
                    }
                }
                Some(FEUnifiedPlatform::Modrinth) => {
                    let modplatforms = app.modplatforms_manager();
                    let modrinth_response = modplatforms.modrinth.search(search_params.into()).await?;
                    Ok(responses::FEUnifiedSearchResponse::from(modrinth_response))
                }
                None => {
                    // Search both platforms and merge results
                    let modplatforms = app.modplatforms_manager();

                    // Try CurseForge, fallback to empty on error
                    let cf_result = match modplatforms.curseforge.search(search_params.clone().into()).await {
                        Ok(response) => response,
                        Err(e) => {
                            tracing::warn!("CurseForge search failed in unified search: {}", e);
                            carbon_platforms::curseforge::CurseForgeResponse {
                                data: vec![],
                                pagination: None,
                            }
                        }
                    };

                    // Try Modrinth
                    let mr_result = match modplatforms.modrinth.search(search_params.into()).await {
                        Ok(response) => response,
                        Err(e) => {
                            tracing::warn!("Modrinth search failed in unified search: {}", e);
                            carbon_platforms::modrinth::search::ProjectSearchResponse {
                                hits: vec![],
                                offset: 0,
                                limit: 40,
                                total_hits: 0,
                            }
                        }
                    };

                    let merged = responses::FEUnifiedSearchResponse::merge(cf_result.into(), mr_result.into());
                    Ok(merged)
                }
            }
        }

        query UNIFIED_GET_PROJECT[app, project: filters::FEUnifiedProjectID] {
            let modplatforms = app.modplatforms_manager();
            let response: responses::FEUnifiedSearchResultWithDescription = match project {
                filters::FEUnifiedProjectID::Curseforge(id) => {
                    let response = modplatforms.curseforge.get_mod(ModParameters {
                        mod_id: id
                    });

                    let description = modplatforms.curseforge.get_mod_description(ModDescriptionParameters {
                        mod_id: id
                    });

                    let (response, description) = tokio::try_join!(response, description)?;

                    responses::FEUnifiedSearchResultWithDescription {
                        result: responses::FEUnifiedSearchResult::from(response),
                        full_description_body: description.data,
                    }
                }
                filters::FEUnifiedProjectID::Modrinth(id) => {
                    let project_response = modplatforms.modrinth.get_project(id.into());
                    let project = project_response.await?;

                    let team_response = modplatforms.modrinth.get_team(modrinth::filters::MRFETeamID(project.team.clone()).into()).await.ok();

                    let body = markdown::to_html_with_options(&project.body, &markdown::Options {
                        compile: markdown::CompileOptions {
                          allow_dangerous_html: true,
                          allow_dangerous_protocol: true,
                          ..markdown::CompileOptions::default()
                        },
                        ..markdown::Options::default()
                    }).map_err(|e| anyhow::anyhow!("Failed to convert markdown to html: {}", e))?;

                    responses::FEUnifiedSearchResultWithDescription {
                        result: responses::FEUnifiedSearchResult::from_project_with_team(
                            project,
                            team_response.map(|tr| tr.into_iter().map(|member| member.into()).collect())
                        ),
                        full_description_body: body,
                    }
                }
            };

            Ok(response)
        }

        query UNIFIED_GET_PROJECTS_BY_IDS[app, request: filters::FEUnifiedBatchRequest] {
            use carbon_platforms::curseforge::filters::{ModSearchParameters, ModSearchParametersQuery, ModsParameters, ModsParametersBody};
            use carbon_platforms::modrinth::search::ProjectIDs;
            use std::collections::HashSet;

            let modplatforms = app.modplatforms_manager();
            let mut results: Vec<responses::FEUnifiedSearchResult> = Vec::new();
            let mut errors: Vec<String> = Vec::new();
            let mut seen_cf_ids: HashSet<i32> = HashSet::new();
            let mut seen_mr_ids: HashSet<String> = HashSet::new();

            // 1. Fetch CurseForge by numeric IDs
            if !request.curseforge_ids.is_empty() {
                match modplatforms.curseforge.get_mods(ModsParameters {
                    body: ModsParametersBody { mod_ids: request.curseforge_ids.clone() }
                }).await {
                    Ok(response) => {
                        for mod_data in response.data {
                            seen_cf_ids.insert(mod_data.id);
                            results.push(responses::FEUnifiedSearchResult::from(mod_data));
                        }
                    }
                    Err(e) => {
                        for id in &request.curseforge_ids {
                            errors.push(format!("CurseForge ID {} not found: {}", id, e));
                        }
                    }
                }
            }

            // 2. Fetch CurseForge-only slugs (from CF URLs)
            for slug in &request.curseforge_only_slugs {
                match modplatforms.curseforge.search(ModSearchParameters {
                    query: ModSearchParametersQuery {
                        game_id: 432,
                        slug: Some(slug.clone()),
                        page_size: Some(1),
                        search_filter: None,
                        game_version: None,
                        category_ids: None,
                        sort_order: None,
                        sort_field: None,
                        class_id: None,
                        mod_loader_types: None,
                        game_version_type_id: None,
                        author_id: None,
                        index: None,
                    }
                }).await {
                    Ok(response) => {
                        if let Some(found) = response.data.into_iter().find(|m| m.slug.eq_ignore_ascii_case(slug)) {
                            if !seen_cf_ids.contains(&found.id) {
                                seen_cf_ids.insert(found.id);
                                results.push(responses::FEUnifiedSearchResult::from(found));
                            }
                        } else {
                            errors.push(format!("CurseForge slug '{}' not found", slug));
                        }
                    }
                    Err(e) => errors.push(format!("CurseForge slug '{}' search error: {}", slug, e))
                }
            }

            // 3. Fetch Modrinth-only IDs (from MR protocol/URL)
            if !request.modrinth_only_ids.is_empty() {
                match modplatforms.modrinth.get_projects(ProjectIDs { ids: request.modrinth_only_ids.clone() }).await {
                    Ok(projects) => {
                        for project in projects {
                            if !seen_mr_ids.contains(&project.id) {
                                seen_mr_ids.insert(project.id.clone());
                                results.push(responses::FEUnifiedSearchResult::from(project));
                            }
                        }
                    }
                    Err(e) => {
                        for id in &request.modrinth_only_ids {
                            errors.push(format!("Modrinth ID '{}' not found: {}", id, e));
                        }
                    }
                }
            }

            // 4. Fetch slugs from BOTH platforms
            for slug in &request.slugs {
                let mut found_on_any = false;

                // Try CurseForge slug search
                if let Ok(response) = modplatforms.curseforge.search(ModSearchParameters {
                    query: ModSearchParametersQuery {
                        game_id: 432,
                        slug: Some(slug.clone()),
                        page_size: Some(1),
                        search_filter: None,
                        game_version: None,
                        category_ids: None,
                        sort_order: None,
                        sort_field: None,
                        class_id: None,
                        mod_loader_types: None,
                        game_version_type_id: None,
                        author_id: None,
                        index: None,
                    }
                }).await {
                    if let Some(found) = response.data.into_iter().find(|m| m.slug.eq_ignore_ascii_case(slug)) {
                        if !seen_cf_ids.contains(&found.id) {
                            seen_cf_ids.insert(found.id);
                            results.push(responses::FEUnifiedSearchResult::from(found));
                            found_on_any = true;
                        }
                    }
                }

                // Try Modrinth (can accept slug as ID)
                if let Ok(projects) = modplatforms.modrinth.get_projects(ProjectIDs { ids: vec![slug.clone()] }).await {
                    for project in projects {
                        if !seen_mr_ids.contains(&project.id) {
                            seen_mr_ids.insert(project.id.clone());
                            results.push(responses::FEUnifiedSearchResult::from(project));
                            found_on_any = true;
                        }
                    }
                }

                if !found_on_any {
                    errors.push(format!("Slug '{}' not found on either platform", slug));
                }
            }

            Ok(filters::FEUnifiedBatchResponse { results, errors })
        }

        query GET_UNIFIED_MODLOADERS[app, _args: ()] {
            Ok(FEUnifiedModLoaders(FEUnifiedModLoaderType::iter().collect::<Vec<_>>()))
        }

        query UNIFIED_SEARCH_PROJECT_TYPE[app, _args: ()] {
            Ok(FEUnifiedSearchType::iter().collect::<Vec<_>>())
        }

        query GET_UNIFIED_CATEGORIES[app, _args:()] {
            let modplatforms = app.modplatforms_manager();

            // Try to get CurseForge categories, but don't fail if unavailable
            let cf_categories = match modplatforms.curseforge.get_categories().await {
                Ok(response) => response.data.into_iter().map(|category| (category.id, FEUnifiedCategory::from(category))).collect(),
                Err(e) => {
                    tracing::warn!("CurseForge categories unavailable: {}. Using Modrinth only.", e);
                    std::collections::HashMap::new()
                }
            };

            // Get Modrinth categories
            let mr_categories = match modplatforms.modrinth.get_categories().await {
                Ok(categories) => categories.into_iter().map(|category| (category.name.clone(), FEUnifiedCategory::from(category))).collect(),
                Err(e) => {
                    tracing::warn!("Modrinth categories unavailable: {}", e);
                    std::collections::HashMap::new()
                }
            };

            Ok(FEUnifiedCategories {
                modrinth: mr_categories,
                curseforge: cf_categories,
            })
        }
    }
}
#[derive(Type, Debug, Serialize)]
#[serde(tag = "platform")]
pub enum RemoteVersion {
    Curseforge(CFFEFile),
    Modrinth(MRFEVersion),
}

impl From<carbon_platforms::RemoteVersion> for RemoteVersion {
    fn from(value: carbon_platforms::RemoteVersion) -> Self {
        use carbon_platforms::RemoteVersion as Other;

        match value {
            Other::Curseforge(cf) => Self::Curseforge(cf.into()),
            Other::Modrinth(mr) => Self::Modrinth(mr.into()),
        }
    }
}
