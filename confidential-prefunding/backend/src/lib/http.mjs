export const readJsonBody = async (request) => {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const body = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(body);
};

export const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(payload, null, 2));
};

export const sendText = (response, statusCode, payload, contentType = "text/plain") => {
  response.writeHead(statusCode, {
    "content-type": `${contentType}; charset=utf-8`
  });
  response.end(payload);
};

