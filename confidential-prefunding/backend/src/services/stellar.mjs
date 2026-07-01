const rpcRequest = async (url, method, params = {}) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: `${method}-${Date.now()}`,
      method,
      params
    })
  });

  if (!response.ok) {
    throw new Error(`RPC ${method} failed with HTTP ${response.status}`);
  }

  const payload = await response.json();

  if (payload.error) {
    throw new Error(`RPC ${method} returned ${payload.error.message}`);
  }

  return payload.result;
};

export const fetchRpcHealth = async (rpcUrl) => rpcRequest(rpcUrl, "getHealth");

export const fetchLatestLedger = async (rpcUrl) => rpcRequest(rpcUrl, "getLatestLedger");

export const fetchHorizonRoot = async (horizonUrl) => {
  const response = await fetch(horizonUrl, {
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Horizon root failed with HTTP ${response.status}`);
  }

  return response.json();
};

export const fetchAnchorToml = async (anchorTomlUrl) => {
  const response = await fetch(anchorTomlUrl);

  if (!response.ok) {
    throw new Error(`Anchor TOML failed with HTTP ${response.status}`);
  }

  return response.text();
};

