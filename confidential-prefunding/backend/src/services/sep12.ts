import type { AppConfig } from "../lib/env.js";
import { newId } from "../lib/ids.js";
import type { AppDatabase } from "../db/sqlite.js";
import { getCustomerByIdOrAccount, parseJson, upsertCustomerStatus } from "../db/sqlite.js";
import { syncParticipantPolicy } from "./participant-policy-sync.js";
import type { CustomerStatus } from "../types/anchor.js";

const toInternalStatus = (status: string | undefined): CustomerStatus => {
  const normalized = (status ?? "NEEDS_INFO").toLowerCase();
  if (normalized === "accepted") return "accepted";
  if (normalized === "rejected") return "rejected";
  if (normalized === "processing" || normalized === "pending") return "pending";
  return "needs_info";
};

const toSep12Status = (status: string): "ACCEPTED" | "REJECTED" | "PROCESSING" | "NEEDS_INFO" => {
  if (status === "accepted") return "ACCEPTED";
  if (status === "rejected") return "REJECTED";
  if (status === "pending") return "PROCESSING";
  return "NEEDS_INFO";
};

const requiredFields = {
  first_name: { description: "Customer first name", type: "string" },
  last_name: { description: "Customer last name", type: "string" },
  email_address: { description: "Customer email address", type: "string" }
};

export const getSep12Customer = (
  db: AppDatabase,
  input: { id?: string | null; account?: string | null; type?: string | null }
) => {
  const row = getCustomerByIdOrAccount(db, { customerId: input.id, account: input.account });
  if (!row) {
    return {
      status: "NEEDS_INFO",
      type: input.type ?? "sep31-sender",
      fields: requiredFields
    };
  }
  const raw = parseJson<Record<string, unknown>>(row.raw);
  return {
    id: row.customer_id,
    account: row.account,
    memo: row.memo,
    status: toSep12Status(row.status),
    type: typeof raw.type === "string" ? raw.type : input.type ?? "sep31-sender",
    message: row.reason ?? undefined,
    provided_fields: raw.provided_fields ?? raw.fields ?? {},
    updated_at: row.updated_at
  };
};

export const putSep12Customer = async (
  config: AppConfig,
  db: AppDatabase,
  input: {
    id?: string | null;
    account: string;
    memo?: string | null;
    type?: string | null;
    status?: string;
    fields?: Record<string, unknown>;
    callback_url?: string | null;
    reason?: string | null;
  }
) => {
  const customerId = input.id ?? newId("cust");
  const internalStatus = toInternalStatus(input.status);
  const raw = {
    protocol: "SEP-12",
    type: input.type ?? "sep31-sender",
    fields: input.fields ?? {},
    callback_url: input.callback_url ?? null
  };
  upsertCustomerStatus(db, {
    customerId,
    account: input.account,
    status: internalStatus,
    memo: input.memo ?? null,
    reason: input.reason ?? null,
    raw
  });

  const participantPolicy =
    internalStatus === "accepted" || internalStatus === "rejected"
      ? await syncParticipantPolicy(config, input.account, internalStatus === "accepted")
      : { synced: false as const, reason: "SEP-12 status does not require on-chain sync" };

  return {
    id: customerId,
    account: input.account,
    status: toSep12Status(internalStatus),
    type: raw.type,
    participantPolicy
  };
};

export const putSep12CustomerCallback = (
  db: AppDatabase,
  input: { id: string; account: string; callback_url: string }
) => {
  const existing = getCustomerByIdOrAccount(db, { customerId: input.id, account: input.account });
  const raw = existing ? parseJson<Record<string, unknown>>(existing.raw) : {};
  upsertCustomerStatus(db, {
    customerId: input.id,
    account: input.account,
    status: existing?.status ?? "needs_info",
    memo: existing?.memo ?? null,
    reason: existing?.reason ?? null,
    raw: { ...raw, callback_url: input.callback_url }
  });
  return { id: input.id, callback_url: input.callback_url };
};

