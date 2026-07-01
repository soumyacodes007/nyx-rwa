import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { openAppDatabase, upsertWatcherCursor } from "../src/db/sqlite.mjs";
import { getDemoState } from "../src/services/demo-state.mjs";

const baseConfig = {
  stellarRpcUrl: "https://rpc.example.test",
  stellarHorizonUrl: "https://horizon.example.test",
  stellarNetworkPassphrase: "Test SDF Network ; September 2015",
  anchorStellarTomlUrl: "https://anchor.example.test/.well-known/stellar.toml",
  anchorPlatformPublicUrl: "http://localhost:8080",
  hostSep10Account: "HOST",
  distributionAccount: "DIST",
  demoAnchorAccount: "ANCHOR"
};

test("returns cached snapshot when live RPC call fails", async () => {
  const dir = mkdtempSync(join(tmpdir(), "prefunding-demo-state-"));
  const db = openAppDatabase(join(dir, "app.sqlite"));
  upsertWatcherCursor(db, "rpc-poller", "cursor-1");

  const originalFetch = global.fetch;

  global.fetch = async (url, options) => {
    if (String(url).includes("rpc.example.test") && options?.body) {
      const body = JSON.parse(options.body);

      if (body.method === "getHealth") {
        return new Response(JSON.stringify({ result: { status: "healthy" } }), {
          status: 200,
          headers: { "content-type": "application/json" }
        });
      }

      if (body.method === "getLatestLedger") {
        return new Response(JSON.stringify({ result: { sequence: 123456 } }), {
          status: 200,
          headers: { "content-type": "application/json" }
        });
      }
    }

    if (String(url).includes("horizon.example.test")) {
      return new Response(
        JSON.stringify({
          core_latest_ledger: 123450,
          history_latest_ledger: 123456,
          network_passphrase: baseConfig.stellarNetworkPassphrase
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" }
        }
      );
    }

    if (String(url).includes("anchor.example.test")) {
      return new Response("VERSION=\"0.1.0\"\n", {
        status: 200,
        headers: { "content-type": "text/plain" }
      });
    }

    throw new Error(`unexpected fetch ${url}`);
  };

  const live = await getDemoState(baseConfig, db);
  assert.equal(live.source, "live");

  global.fetch = async (url) => {
    if (String(url).includes("rpc.example.test")) {
      throw new Error("rpc offline");
    }

    throw new Error(`unexpected fetch ${url}`);
  };

  const cached = await getDemoState(baseConfig, db);
  assert.equal(cached.source, "cache");
  assert.equal(cached.snapshot.stellar.rpc.latestLedgerSequence, 123456);

  global.fetch = originalFetch;
  rmSync(dir, { recursive: true, force: true });
});
