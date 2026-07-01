import { spawnSync } from "node:child_process";

const friendbotUrl = process.env.STELLAR_FRIENDBOT_URL ?? "https://friendbot.stellar.org";
const accounts = [
  process.env.HOST_SEP10_ACCOUNT,
  process.env.DISTRIBUTION_ACCOUNT,
  process.env.DEMO_ANCHOR_ACCOUNT
].filter(Boolean);

for (const account of accounts) {
  const url = new URL(friendbotUrl);
  url.searchParams.set("addr", account);

  const result = spawnSync("curl", ["-fsSL", url.toString()], {
    encoding: "utf8"
  });

  if (result.status !== 0) {
    const retry = spawnSync("curl", ["-sSL", "-D", "-", url.toString()], {
      encoding: "utf8"
    });
    const responseText = `${retry.stdout}\n${retry.stderr}`.trim();

    if (responseText.includes("account already funded to starting balance")) {
      console.log(`already funded ${account}`);
      continue;
    }

    console.error(`friendbot failed for ${account}: ${responseText}`);
    process.exitCode = 1;
    continue;
  }

  console.log(`funded ${account}`);
}
