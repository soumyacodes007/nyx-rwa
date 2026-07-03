import * as StellarSdk from "@stellar/stellar-sdk";
import type { AppConfig } from "../lib/env.js";
import { operatorKeypair, submitOperatorContractCall } from "./operator-tx.js";

export type ParticipantPolicySyncResult =
  | { synced: true; hash: string; ledger?: number }
  | { synced: false; reason: string };

export const syncParticipantPolicy = async (
  config: AppConfig,
  account: string,
  approved: boolean
): Promise<ParticipantPolicySyncResult> => {
  const contractId = config.contracts.participantPolicy;
  const operatorSecret = config.participantPolicyOperatorSecretKey;
  if (!contractId) return { synced: false, reason: "PARTICIPANT_POLICY_CONTRACT_ID is not configured" };
  if (!operatorSecret) return { synced: false, reason: "PARTICIPANT_POLICY_OPERATOR_SECRET_KEY is not configured" };

  const operator = operatorKeypair(config);
  try {
    const tx = await submitOperatorContractCall(config, contractId, "set_participant", [
      StellarSdk.Address.fromString(account).toScVal(),
      StellarSdk.nativeToScVal(approved),
      StellarSdk.nativeToScVal(1, { type: "u32" }),
      StellarSdk.nativeToScVal(approved ? 1 : 9, { type: "u32" }),
      StellarSdk.nativeToScVal(0, { type: "u32" }),
      StellarSdk.Address.fromString(operator.publicKey()).toScVal()
    ]);
    return { synced: true, hash: tx.hash, ledger: tx.ledger };
  } catch (error) {
    return { synced: false, reason: error instanceof Error ? error.message : String(error) };
  }
};
