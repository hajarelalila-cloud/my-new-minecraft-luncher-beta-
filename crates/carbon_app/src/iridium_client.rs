pub fn get_client(nokiatis_base_api: String) -> reqwest_middleware::ClientBuilder {
    use reqwest::{Request, Response};
    use reqwest_middleware::{Middleware, Next};

    use crate::managers::modplatforms::modrinth::MODRINTH_API_BASE;

    struct AddHeaderMiddleware {
        nokiatis_api_base_host: url::Url,
    };

    let nokiatis_api_base_host =
        url::Url::parse(&nokiatis_base_api).expect("Failed to parse Nokiatis Launcher API base URL");

    #[async_trait::async_trait]
    impl Middleware for AddHeaderMiddleware {
        async fn handle(
            &self,
            mut req: Request,
            _extensions: &mut axum::http::Extensions,
            next: Next<'_>,
        ) -> reqwest_middleware::Result<Response> {
            // Parse CurseForge API base URL - use default if not set
            let curseforge_api_base = option_env!("CURSEFORGE_API_BASE")
                .map(|s| url::Url::parse(s).expect("Failed to parse CURSEFORGE_API_BASE"))
                .unwrap_or_else(|| {
                    url::Url::parse("https://api.curseforge.com").expect("Failed to parse default CurseForge URL")
                });

            if req.url().host_str() == curseforge_api_base.host_str() {
                // Only add API key if it's set
                if let Some(api_key) = option_env!("CURSEFORGE_API_KEY") {
                    if !api_key.is_empty() && api_key != "your_curseforge_api_key_here" {
                        let api_key_header = api_key
                            .parse()
                            .expect("Failed to parse CURSEFORGE_API_KEY as header value");
                        req.headers_mut().insert("x-api-key", api_key_header);
                    }
                }

                req.headers_mut().insert(
                    "Content-Type",
                    "application/json"
                        .parse()
                        .expect("Failed to parse Content-Type header"),
                );

                req.headers_mut().insert(
                    "Accept",
                    "application/json"
                        .parse()
                        .expect("Failed to parse Accept header"),
                );
            }

            let modrinth_api_base =
                url::Url::parse(MODRINTH_API_BASE).expect("Failed to parse MODRINTH_API_BASE URL");

            if req.url().host_str() == modrinth_api_base.host_str() {
                req.headers_mut().insert(
                    "Content-Type",
                    "application/json"
                        .parse()
                        .expect("Failed to parse Content-Type header"),
                );

                req.headers_mut().insert(
                    "Accept",
                    "application/json"
                        .parse()
                        .expect("Failed to parse Accept header"),
                );
            }

            // Continue with the modified request.
            next.run(req, _extensions).await
        }
    }

    let client = reqwest::Client::builder()
        .user_agent(format!(
            "{} {}",
            env!("USER_AGENT_PREFIX"),
            env!("APP_VERSION")
        ))
        .build()
        .expect("Failed to build HTTP client");
    reqwest_middleware::ClientBuilder::new(client).with(AddHeaderMiddleware { nokiatis_api_base_host })
}
