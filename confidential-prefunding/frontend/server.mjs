import http from "node:http";
import { config } from "../backend/src/lib/env.mjs";
import { sendJson, sendText } from "../backend/src/lib/http.mjs";

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Confidential Prefunding Phase 1</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f4efe8;
        --panel: #fffaf4;
        --ink: #1f2933;
        --muted: #55606d;
        --accent: #b45309;
        --line: #e6dac8;
      }
      body {
        margin: 0;
        font-family: "Iowan Old Style", "Palatino Linotype", serif;
        background:
          radial-gradient(circle at top left, rgba(180, 83, 9, 0.18), transparent 30%),
          linear-gradient(180deg, #f8f3ec 0%, var(--bg) 100%);
        color: var(--ink);
      }
      main {
        max-width: 960px;
        margin: 0 auto;
        padding: 48px 20px 64px;
      }
      .panel {
        background: rgba(255, 250, 244, 0.92);
        border: 1px solid var(--line);
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 16px 40px rgba(31, 41, 51, 0.08);
      }
      h1 {
        margin: 0 0 8px;
        font-size: clamp(2rem, 4vw, 3.5rem);
      }
      p {
        color: var(--muted);
        line-height: 1.6;
      }
      ul {
        padding-left: 20px;
      }
      a {
        color: var(--accent);
      }
      pre {
        overflow: auto;
        background: #221b15;
        color: #f6ede1;
        padding: 16px;
        border-radius: 14px;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="panel">
        <h1>Confidential Prefunding</h1>
        <p>Phase 1 boots the base stack: Anchor Platform, business callbacks, API cache, worker, and a status frontend.</p>
        <ul>
          <li>Anchor Platform: <a href="http://localhost:8080">http://localhost:8080</a></li>
          <li>API health: <a href="http://localhost:${config.apiPort}/health">http://localhost:${config.apiPort}/health</a></li>
          <li>Demo state: <a href="http://localhost:${config.apiPort}/api/demo/state">http://localhost:${config.apiPort}/api/demo/state</a></li>
          <li>Business server: <a href="http://localhost:${config.businessServerPort}/health">http://localhost:${config.businessServerPort}/health</a></li>
        </ul>
        <h2>Live Demo State</h2>
        <pre id="state">Loading...</pre>
      </section>
    </main>
    <script>
      const target = document.getElementById("state");
      fetch("http://localhost:${config.apiPort}/api/demo/state")
        .then((response) => response.json())
        .then((payload) => {
          target.textContent = JSON.stringify(payload, null, 2);
        })
        .catch((error) => {
          target.textContent = JSON.stringify({ error: error.message }, null, 2);
        });
    </script>
  </body>
</html>`;

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "GET" && url.pathname === "/health") {
    return sendJson(response, 200, {
      status: "ok",
      service: "frontend"
    });
  }

  if (request.method === "GET" && url.pathname === "/") {
    return sendText(response, 200, html, "text/html");
  }

  return sendJson(response, 404, {
    error: "not_found",
    path: url.pathname
  });
});

server.listen(config.frontendPort, "0.0.0.0", () => {
  console.log(
    JSON.stringify(
      {
        service: "frontend",
        port: config.frontendPort
      },
      null,
      2
    )
  );
});
