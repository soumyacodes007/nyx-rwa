#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("usage: npm run refresh:confidential-artifacts -- [env_path] [proof_of_life_report_path] [profile]");
  process.exit(0);
}

const envPath = resolve(process.argv[2] ?? ".env");
const reportPath = resolve(process.argv[3] ?? "oz-confidential/state/proof-of-life-report.json");

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const report = readJson(reportPath);
const draw = report.tests?.nyx_live_draw_artifact;
const repayment = report.tests?.nyx_live_repayment_artifact;
const profile = String(
  process.argv[4] ?? process.env.NYX_DEMO_ANCHOR_PROFILE ?? process.env.DEMO_ANCHOR_PROFILE ?? draw?.profile ?? "alpha"
).toLowerCase();
const prefix = profile.replace(/[^a-z0-9]/gi, "_").replace(/^_+|_+$/g, "").toUpperCase();

if (!report.contracts?.cusdc) throw new Error("proof-of-life report missing contracts.cusdc");
if (!report.accounts?.[profile]) throw new Error(`proof-of-life report missing accounts.${profile}`);
if (!report.accounts?.facility) throw new Error("proof-of-life report missing accounts.facility");
if (!report.accounts?.auditor) throw new Error("proof-of-life report missing accounts.auditor");
if (!report.accounts?.["credit-executor"]) {
  throw new Error("proof-of-life report missing accounts.credit-executor");
}
if (profile !== "alpha" && !report.account_secrets?.[profile]) {
  throw new Error(`proof-of-life report missing account_secrets.${profile}`);
}
if (!draw?.data_xdr_base64) throw new Error("proof-of-life report missing draw data_xdr_base64");
if (!repayment?.data_xdr_base64) {
  throw new Error("proof-of-life report missing repayment data_xdr_base64");
}

const drawAuditorPayload = {
  ...(draw.transfer ?? {}),
  // Older proof-of-life reports omitted the original spender-transfer sigma_a.
  // The demo runner uses sigma_a=407 for the exported Nyx draw artifact.
  ...(draw.transfer?.sigma_a || draw.transfer?.sigma ? {} : { sigma_a: "407" })
};

const baseValues = {
  CONFIDENTIAL_CUSDC_CONTRACT_ID: report.contracts.cusdc,
  FACILITY_PUBLIC_KEY: report.accounts.facility,
  AUDITOR_PUBLIC_KEY: report.accounts.auditor,
  CREDIT_EXECUTOR_PUBLIC_KEY: report.accounts["credit-executor"]
};

const profileValues = {
  [`${prefix}_PUBLIC_KEY`]: report.accounts[profile],
  [`${prefix}_ANCHOR_SECRET_KEY`]: report.account_secrets?.[profile] ?? "",
  [`${prefix}_ORGANIZATION_NAME`]:
    profile === "alpha" ? "Alpha Remit" : `${profile.slice(0, 1).toUpperCase()}${profile.slice(1)} Remit`,
  [`${prefix}_EMAIL_ADDRESS`]:
    profile === "alpha" ? "ops@alpha-remit.example" : `ops@${profile.replace(/[^a-z0-9-]/g, "-")}.example`,
  [`${prefix}_DRAW_TRANSFER_DATA_XDR_BASE64`]: draw.data_xdr_base64,
  [`${prefix}_DRAW_AUDITOR_PAYLOAD_JSON`]: JSON.stringify(drawAuditorPayload),
  [`${prefix}_REPAYMENT_TRANSFER_DATA_XDR_BASE64`]: repayment.data_xdr_base64,
  [`${prefix}_REPAYMENT_AUDITOR_PAYLOAD_JSON`]: JSON.stringify(repayment.transfer ?? {})
};

const compatibilityValues =
  profile === "alpha"
    ? {
        ALPHA_PUBLIC_KEY: report.accounts.alpha,
        DEMO_ANCHOR_ACCOUNT: report.accounts.alpha,
        ...(report.account_secrets?.alpha ? { DEMO_ANCHOR_SECRET_KEY: report.account_secrets.alpha } : {}),
        DRAW_TRANSFER_DATA_XDR_BASE64: draw.data_xdr_base64,
        DRAW_AUDITOR_PAYLOAD_JSON: JSON.stringify(drawAuditorPayload),
        REPAYMENT_TRANSFER_DATA_XDR_BASE64: repayment.data_xdr_base64,
        REPAYMENT_AUDITOR_PAYLOAD_JSON: JSON.stringify(repayment.transfer ?? {})
      }
    : {
        DEMO_ANCHOR_PROFILE: profile,
        DEMO_SEP31_TRANSACTION_ID: `sep31-${profile}-001`
      };

const values = {
  ...baseValues,
  ...profileValues,
  ...compatibilityValues
};

if (!values[`${prefix}_ANCHOR_SECRET_KEY`]) {
  delete values[`${prefix}_ANCHOR_SECRET_KEY`];
}

if (profile === "alpha") {
  Object.assign(values, {
  ALPHA_PUBLIC_KEY: report.accounts.alpha,
  CREDIT_EXECUTOR_PUBLIC_KEY: report.accounts["credit-executor"],
  DRAW_TRANSFER_DATA_XDR_BASE64: draw.data_xdr_base64,
  DRAW_AUDITOR_PAYLOAD_JSON: JSON.stringify(drawAuditorPayload),
  REPAYMENT_TRANSFER_DATA_XDR_BASE64: repayment.data_xdr_base64,
  REPAYMENT_AUDITOR_PAYLOAD_JSON: JSON.stringify(repayment.transfer ?? {})
  });
}

const existing = readFileSync(envPath, "utf8");
const seen = new Set();
const lines = existing.split(/\r?\n/).map((line) => {
  const splitAt = line.indexOf("=");
  if (splitAt < 1) return line;
  const key = line.slice(0, splitAt);
  if (!Object.prototype.hasOwnProperty.call(values, key)) return line;
  seen.add(key);
  return `${key}=${values[key]}`;
});

for (const [key, value] of Object.entries(values)) {
  if (!seen.has(key)) lines.push(`${key}=${value}`);
}

writeFileSync(envPath, `${lines.join("\n").replace(/\n*$/, "")}\n`);

console.log(
  JSON.stringify(
    {
      updated: Object.keys(values),
      profile,
      confidentialCusdc: values.CONFIDENTIAL_CUSDC_CONTRACT_ID,
      anchor: report.accounts[profile],
      facility: values.FACILITY_PUBLIC_KEY,
      creditExecutor: values.CREDIT_EXECUTOR_PUBLIC_KEY,
      drawArtifactBytes: Buffer.from(draw.data_xdr_base64, "base64").length,
      repaymentArtifactBytes: Buffer.from(repayment.data_xdr_base64, "base64").length
    },
    null,
    2
  )
);
