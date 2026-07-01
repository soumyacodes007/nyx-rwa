import { getSnapshot, getWatcherCursor, upsertSnapshot } from "../db/sqlite.mjs";
import {
  fetchAnchorToml,
  fetchHorizonRoot,
  fetchLatestLedger,
  fetchRpcHealth
} from "./stellar.mjs";

const SNAPSHOT_KEY = "demo_state";

export const buildLiveSnapshot = async (config, db) => {
  const [rpcHealth, latestLedger, horizonRoot, anchorToml] = await Promise.all([
    fetchRpcHealth(config.stellarRpcUrl),
    fetchLatestLedger(config.stellarRpcUrl),
    fetchHorizonRoot(config.stellarHorizonUrl),
    fetchAnchorToml(config.anchorStellarTomlUrl)
  ]);

  const watcherCursor = getWatcherCursor(db, "rpc-poller");
  const now = new Date().toISOString();

  const snapshot = {
    generatedAt: now,
    network: {
      rpcUrl: config.stellarRpcUrl,
      horizonUrl: config.stellarHorizonUrl,
      networkPassphrase: config.stellarNetworkPassphrase
    },
    demoAccounts: {
      hostSep10: config.hostSep10Account,
      distribution: config.distributionAccount,
      anchor: config.demoAnchorAccount
    },
    anchorPlatform: {
      publicUrl: config.anchorPlatformPublicUrl,
      stellarTomlPreview: anchorToml.split("\n").slice(0, 6),
      reachable: true
    },
    stellar: {
      rpc: {
        status: rpcHealth.status ?? "unknown",
        latestLedgerSequence: latestLedger.sequence ?? null
      },
      horizon: {
        coreLatestLedger: horizonRoot.core_latest_ledger ?? null,
        historyLatestLedger: horizonRoot.history_latest_ledger ?? null,
        networkPassphrase: horizonRoot.network_passphrase ?? null
      }
    },
    cache: {
      watcherCursor
    }
  };

  upsertSnapshot(db, SNAPSHOT_KEY, snapshot, "live");

  return {
    source: "live",
    snapshot
  };
};

export const getDemoState = async (config, db) => {
  try {
    return await buildLiveSnapshot(config, db);
  } catch (error) {
    const cached = getSnapshot(db, SNAPSHOT_KEY);

    if (!cached) {
      return {
        source: "unavailable",
        error: error instanceof Error ? error.message : String(error),
        snapshot: null
      };
    }

    return {
      source: "cache",
      snapshot: cached.payload,
      cacheMetadata: {
        sourceStatus: cached.sourceStatus,
        sourceTimestamp: cached.sourceTimestamp,
        updatedAt: cached.updatedAt
      },
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

