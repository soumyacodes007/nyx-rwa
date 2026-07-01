const get = (name, fallback) => process.env[name] ?? fallback;

const urls = {
  frontend: `http://localhost:${get("FRONTEND_PORT", "3000")}`,
  apiHealth: `http://localhost:${get("API_PORT", "3001")}/health`,
  apiDemoState: `http://localhost:${get("API_PORT", "3001")}/api/demo/state`,
  anchorSep: `http://localhost:${get("ANCHOR_SEP_PORT", "8080")}/.well-known/stellar.toml`,
  anchorPlatformApi: `http://localhost:${get("ANCHOR_PLATFORM_API_PORT", "8085")}`,
  businessServer: `http://localhost:${get("BUSINESS_SERVER_PORT", "8091")}/health`
};

console.log("Service URLs");
for (const [name, url] of Object.entries(urls)) {
  console.log(`- ${name}: ${url}`);
}

