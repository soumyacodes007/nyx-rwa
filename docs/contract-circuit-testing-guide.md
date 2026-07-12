# Contract And Circuit Testing Guide

This guide documents how to test Nyx's core trust layer: Soroban contracts and Noir circuits.

The backend and dashboard help operate the demo, but the main correctness claims come from:

- Soroban contracts enforcing policy, locks, draw/repay lifecycle, and verifier calls.
- Noir circuits proving private collateral and private repayment-history statements.
- OZ Confidential Token circuits proving private token operations.
- UltraHonk verifier artifacts connecting circuit outputs to on-chain verification.

## Tested Toolchain

These are the versions used for the latest local validation:

| Tool | Version |
|:--|:--|
| Rust | `rustc 1.96.1` |
| Cargo | `cargo 1.96.1` |
| Nargo | `1.0.0-beta.11` |
| bb | `0.87.0` |

Check locally:

```bash
cd oz-confidential
cargo --version
rustc --version

cd circuits
nargo --version
bb --version
```

## Quick Pass

Run this before pushing contract or circuit changes:

```bash
cd oz-confidential
cargo test --workspace

cd circuits
nargo test --workspace
nargo compile --workspace
```

Expected result from the latest run:

```txt
Soroban/Rust: cargo test --workspace passed
PrefundingCreditLine: 9 contract tests passed
Noir: nargo test --workspace passed
Noir circuit tests: 159 passed
Noir compile: nargo compile --workspace passed
```

## Contract Tests

Run all Rust/Soroban contract tests:

```bash
cd oz-confidential
cargo test --workspace
```

What this validates:

| Area | What is covered |
|:--|:--|
| Contract compilation | Every workspace contract compiles against the pinned Soroban SDK. |
| Credit lifecycle | `PrefundingCreditLine` opens credit, records draw, records repayment, and releases locks. |
| Failure paths | Bad proof, reused lock, mismatched draw commitment, failed transfer, premature liquidation, and repay-after-liquidation are rejected. |
| Event path | Credit lifecycle tests cover the stable event surface used by the watcher. |

Current substantive contract test set:

```txt
open_draw_repay_happy_path
open_credit_rejects_failing_proof
paused_blocks_open_credit
reusing_active_lock_key_fails
execute_draw_rejects_mismatched_commitment
execute_draw_reverts_if_transfer_fails
repay_reverts_if_transfer_fails_and_keeps_collateral_frozen
liquidate_before_due_ledger_fails
liquidate_after_due_ledger_seizes_and_blocks_repay
```

Run only the credit-line contract tests:

```bash
cd oz-confidential
cargo test -p nyx-prefunding-credit-line
```

Run one specific test:

```bash
cd oz-confidential
cargo test -p nyx-prefunding-credit-line open_draw_repay_happy_path -- --nocapture
```

## Circuit Tests

Run all Noir circuit tests:

```bash
cd oz-confidential/circuits
nargo test --workspace
```

What this validates:

| Circuit family | What is covered |
|:--|:--|
| Collateral sufficiency | Sufficient private collateral passes; insufficient collateral and wrong owner fail. |
| Repayment history | Threshold met passes; forged root and threshold failure are rejected. |
| Register | Spending/viewing key derivation, contract binding, invalid keys, and off-curve inputs. |
| Transfer | Private balance opening, private transfer amount, underfunded transfer rejection, auditor ciphertext integrity. |
| Set spender | Confidential allowance creation, escrow consistency, wrong key/input rejection. |
| Spender transfer | Delegated confidential transfer and remaining allowance update. |
| Revoke spender | Remaining allowance returns to spendable balance with auditor evidence. |
| Withdraw | Confidential-to-public withdrawal accounting and auditor checkpoint data. |
| Shared lib | Pedersen commitments, Poseidon-domain hashing, ECDH, encryption/decryption, fixture consistency. |

Current Noir test count from latest run:

```txt
collateral_sufficiency: 3
register: 7
repayment_history: 3
revoke_spender: 24
set_spender: 26
spender_transfer: 30
transfer: 28
withdraw: 19
stellar_confidential_lib: 19
total substantive Noir tests: 159
```

Run a specific package:

```bash
cd oz-confidential/circuits
nargo test --package circuit_collateral_sufficiency
nargo test --package circuit_repayment_history
nargo test --package circuit_transfer
```

Run one named test:

```bash
cd oz-confidential/circuits
nargo test accepts_sufficient_owned_collateral --package circuit_collateral_sufficiency
nargo test rejects_forged_root --package circuit_repayment_history
```

Compile all circuits:

```bash
cd oz-confidential/circuits
nargo compile --workspace
```

## Verification Key Checks

Verifier keys live in:

```txt
oz-confidential/circuits/vks/
```

Regenerate VK artifacts only when circuit source changes intentionally:

```bash
cd oz-confidential/circuits
./scripts/extract_vks.sh
./scripts/build_vk_bins.sh
```

Then inspect the diff:

```bash
git diff -- oz-confidential/circuits/vks
```

Rules:

- If a circuit changed, commit the source change and matching VK artifact change together.
- If VKs changed without an intentional circuit change, stop and investigate the toolchain or dependency drift.
- `*.vk.json` is review-friendly.
- `*.vk.bin` is the packed on-chain verifier form.

## What To Run Before Mainnet Or Demo

For local correctness:

```bash
cd oz-confidential
cargo test --workspace

cd circuits
nargo test --workspace
nargo compile --workspace
```

For proof/demo readiness:

```bash
cd oz-confidential/circuits
./scripts/extract_vks.sh
./scripts/build_vk_bins.sh
git diff -- oz-confidential/circuits/vks
```

For backend integration sanity:

```bash
npm test
```

For live demo readiness, after contracts/circuits pass:

```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/demo/state
curl http://localhost:3001/api/demo-flow/state
```

## Interpreting Failures

| Failure | Meaning | First check |
|:--|:--|:--|
| `cargo test` compile failure | Contract API, SDK, dependency, or generated client drift. | Check changed contracts and `Cargo.lock`. |
| Credit-line test failure | Lifecycle, auth, lock, transfer, or liquidation behavior changed. | Re-run the failing test with `-- --nocapture`. |
| `nargo test` failure | Circuit constraint or fixture behavior changed. | Identify whether the failing test is a happy path or rejection path. |
| VK diff after no circuit change | Toolchain drift or accidental artifact regeneration. | Confirm `nargo` and `bb` versions. |
| Proof verifies locally but contract rejects | Public input packing or verifier key mismatch. | Compare circuit public inputs, `*.vk.bin`, and verifier contract deployment. |

## Latest Local Validation

Last validated from repo root environment:

```txt
cargo test --workspace: passed
nargo test --workspace: passed
nargo compile --workspace: passed
```

Observed warnings:

```txt
oz-confidential-runner has two dead-code warnings for unused fields in demo runner structs.
These warnings do not affect contract or circuit correctness.
```

Note on Soroban snapshots:

```txt
cargo test can refresh files under contracts/*/test_snapshots when auth trees or event surfaces change.
Always review those diffs before committing; they are evidence artifacts, not source code.
```
