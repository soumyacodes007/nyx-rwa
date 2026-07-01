const required = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const number = (name, fallback) => Number(required(name, String(fallback)));

export const config = {
  apiPort: number("API_PORT", 3001),
  businessServerPort: number("BUSINESS_SERVER_PORT", 8091),
  frontendPort: number("FRONTEND_PORT", 3000),
  appStateDbPath: required("APP_STATE_DB_PATH", "/data/app.sqlite"),
  stellarRpcUrl: required("STELLAR_RPC_URL", "https://soroban-testnet.stellar.org"),
  stellarHorizonUrl: required("STELLAR_HORIZON_URL", "https://horizon-testnet.stellar.org"),
  stellarNetworkPassphrase: required(
    "STELLAR_NETWORK_PASSPHRASE",
    "Test SDF Network ; September 2015"
  ),
  friendbotUrl: required("STELLAR_FRIENDBOT_URL", "https://friendbot.stellar.org"),
  anchorPlatformUrl: required("ANCHOR_PLATFORM_URL", "http://anchor-platform:8080"),
  anchorPlatformPublicUrl: required(
    "ANCHOR_PLATFORM_PUBLIC_URL",
    "http://localhost:8080"
  ),
  anchorStellarTomlUrl: required(
    "ANCHOR_STELLAR_TOML_URL",
    "http://anchor-platform:8080/.well-known/stellar.toml"
  ),
  frontendApiBaseUrl: required("FRONTEND_API_BASE_URL", "http://api:3001"),
  hostSep10Account: required("HOST_SEP10_ACCOUNT", "REPLACE_ME"),
  distributionAccount: required("DISTRIBUTION_ACCOUNT", "REPLACE_ME"),
  demoAnchorAccount: required("DEMO_ANCHOR_ACCOUNT", "REPLACE_ME")
};

