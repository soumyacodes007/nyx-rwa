# Confidential Prefunding

Phase 1 scaffolds the local infra base for the confidential prefunding demo:

- Anchor Platform on Stellar testnet
- Custom business callback server
- API service with SQLite-backed cached demo state
- Prover worker placeholder with shared app state
- Frontend status page

## Start

```bash
cd confidential-prefunding
./scripts/start.sh
```

## Smoke Test

```bash
cd confidential-prefunding
./scripts/smoke-phase1.sh
```

## Important URLs

- Frontend: `http://localhost:3000`
- API health: `http://localhost:3001/health`
- API demo state: `http://localhost:3001/api/demo/state`
- Anchor Platform SEP server: `http://localhost:8080/.well-known/stellar.toml`
- Anchor Platform API: `http://localhost:8085`
- Business server: `http://localhost:8091/health`

## Notes

- Docker Desktop with WSL integration must be enabled for `docker compose`.
- `backend` and `prover-worker` share `./data/app.sqlite`, which lets the cache survive container restarts.
- The contract IDs in `.env` are placeholders for Phase 2.
