#!/usr/bin/env bash
set -euo pipefail

docker_cmd() {
  if command -v docker >/dev/null 2>&1; then
    echo "docker"
    return
  fi

  if [ -x "/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe" ]; then
    echo "/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe"
    return
  fi

  echo ""
}

DOCKER_BIN="$(docker_cmd)"

if [ -z "${DOCKER_BIN}" ]; then
  echo "docker is not available in this shell. Enable Docker Desktop WSL integration first."
  exit 1
fi

set -a
source ./.env
set +a

wait_for_url() {
  local url="$1"
  local attempts="${2:-30}"

  for _ in $(seq 1 "${attempts}"); do
    if curl -fsSL "${url}" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  echo "Timed out waiting for ${url}"
  return 1
}

wait_for_demo_source() {
  local expected="$1"
  local attempts="${2:-30}"

  for _ in $(seq 1 "${attempts}"); do
    local payload
    if payload="$(curl -fsSL "${api_state_url}" 2>/dev/null)" && printf '%s' "${payload}" | grep "\"source\": \"${expected}\"" >/dev/null; then
      return 0
    fi
    sleep 1
  done

  echo "Timed out waiting for demo state source=${expected}"
  return 1
}

cleanup() {
  rm -f ./.env.smoke
  if [ -f ./.env.backup ]; then
    mv ./.env.backup ./.env
  fi
}

trap cleanup EXIT

api_state_url="http://localhost:${API_PORT}/api/demo/state"
api_health_url="http://localhost:${API_PORT}/health"
anchor_toml_url="http://localhost:${ANCHOR_SEP_PORT}/.well-known/stellar.toml"

echo "Checking Anchor Platform SEP endpoint"
curl -fsSL "${anchor_toml_url}" >/dev/null

echo "Funding demo accounts on testnet"
node scripts/fund-demo-accounts.mjs

echo "Checking API health"
curl -fsSL "${api_health_url}" >/dev/null

echo "Priming demo state cache"
wait_for_demo_source "live"

echo "Restarting app services"
"${DOCKER_BIN}" compose restart api prover-worker >/dev/null
wait_for_url "${api_health_url}"

echo "Recreating API with invalid RPC URL to verify cache fallback"
cp ./.env ./.env.backup
cp ./.env.backup ./.env
python3 - <<'PY'
from pathlib import Path
path = Path(".env")
text = path.read_text()
text = text.replace(
    'STELLAR_RPC_URL=https://soroban-testnet.stellar.org',
    'STELLAR_RPC_URL=http://127.0.0.1:1'
)
path.write_text(text)
PY
export STELLAR_RPC_URL="http://127.0.0.1:1"
"${DOCKER_BIN}" compose up -d --force-recreate --no-deps api >/dev/null
wait_for_url "${api_health_url}"
wait_for_demo_source "cache"

echo "Restoring API with valid RPC URL"
mv ./.env.backup ./.env
export STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
"${DOCKER_BIN}" compose up -d --force-recreate --no-deps api >/dev/null
wait_for_url "${api_health_url}"
wait_for_demo_source "live"

echo "Phase 1 smoke test passed"
