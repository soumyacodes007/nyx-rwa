import * as StellarSdk from "@stellar/stellar-sdk";
import type { AppConfig } from "../lib/env.js";
import { fetchLatestLedger } from "./stellar-rpc.js";
import { operatorKeypair, submitOperatorContractCall } from "./operator-tx.js";

const addressArg = (address: string): StellarSdk.xdr.ScVal =>
  StellarSdk.Address.fromString(address).toScVal();

export const refreshMockOracle = async (
  config: AppConfig,
  input: { asset?: string; priceE7?: string; updatedLedger?: number }
) => {
  if (config.oracleMode !== "mock") {
    throw new Error(`oracle refresh is only available when ORACLE_MODE=mock, current=${config.oracleMode}`);
  }
  const contractId = config.contracts.oracleAdapter;
  const asset = input.asset ?? config.contracts.collateralToken;
  if (!contractId) throw new Error("ORACLE_ADAPTER_CONTRACT_ID is not configured");
  if (!asset) throw new Error("COLLATERAL_TOKEN_CONTRACT_ID is not configured");

  const latestLedger = input.updatedLedger ?? Number((await fetchLatestLedger(config.stellarRpcUrl)).sequence ?? 0);
  if (!Number.isFinite(latestLedger) || latestLedger <= 0) {
    throw new Error("latest ledger is unavailable");
  }
  const operator = operatorKeypair(config);
  const priceE7 = BigInt(input.priceE7 ?? "10000000");
  const tx = await submitOperatorContractCall(config, contractId, "set_price", [
    addressArg(asset),
    StellarSdk.nativeToScVal(priceE7, { type: "i128" }),
    StellarSdk.nativeToScVal(latestLedger, { type: "u32" }),
    addressArg(operator.publicKey())
  ]);
  return {
    oracleMode: config.oracleMode,
    oracleAdapter: contractId,
    asset,
    priceE7: priceE7.toString(),
    updatedLedger: latestLedger,
    tx
  };
};

