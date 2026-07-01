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

"${DOCKER_BIN}" compose up --build -d
node scripts/print-urls.mjs
