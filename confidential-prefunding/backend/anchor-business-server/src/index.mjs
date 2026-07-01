import http from "node:http";
import { config } from "../../src/lib/env.mjs";
import { readJsonBody, sendJson } from "../../src/lib/http.mjs";

const acceptedResponse = (path, method, body) => ({
  accepted: true,
  service: "business-server",
  path,
  method,
  receivedAt: new Date().toISOString(),
  echo: body
});

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "GET" && url.pathname === "/health") {
    return sendJson(response, 200, {
      status: "ok",
      service: "business-server",
      timestamp: new Date().toISOString()
    });
  }

  if (request.method === "POST") {
    const body = await readJsonBody(request);

    if (url.pathname === "/quotes") {
      return sendJson(response, 200, {
        id: `quote-${Date.now()}`,
        sell_asset: "iso4217:USD",
        buy_asset: "stellar:native",
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        price: "1.00",
        fee: {
          total: "0.25",
          asset: "iso4217:USD"
        },
        memo: null,
        body
      });
    }

    return sendJson(response, 200, acceptedResponse(url.pathname, request.method, body));
  }

  if (request.method === "GET") {
    return sendJson(response, 200, acceptedResponse(url.pathname, request.method, {}));
  }

  return sendJson(response, 405, {
    error: "method_not_allowed",
    path: url.pathname
  });
});

server.listen(config.businessServerPort, "0.0.0.0", () => {
  console.log(
    JSON.stringify(
      {
        service: "business-server",
        port: config.businessServerPort
      },
      null,
      2
    )
  );
});

