import http from "node:http";
import { config } from "./lib/env.mjs";
import { sendJson } from "./lib/http.mjs";
import { openAppDatabase } from "./db/sqlite.mjs";
import { getDemoState } from "./services/demo-state.mjs";

const db = openAppDatabase(config.appStateDbPath);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "GET" && url.pathname === "/health") {
      return sendJson(response, 200, {
        status: "ok",
        service: "api",
        databasePath: config.appStateDbPath,
        timestamp: new Date().toISOString()
      });
    }

    if (request.method === "GET" && url.pathname === "/api/demo/state") {
      const demoState = await getDemoState(config, db);
      const statusCode = demoState.source === "unavailable" ? 503 : 200;
      return sendJson(response, statusCode, demoState);
    }

    return sendJson(response, 404, {
      error: "not_found",
      path: url.pathname
    });
  } catch (error) {
    return sendJson(response, 500, {
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

server.listen(config.apiPort, "0.0.0.0", () => {
  console.log(
    JSON.stringify(
      {
        service: "api",
        port: config.apiPort,
        databasePath: config.appStateDbPath
      },
      null,
      2
    )
  );
});

