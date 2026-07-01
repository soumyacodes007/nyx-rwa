import { config } from "./lib/env.mjs";
import { getWatcherCursor, openAppDatabase, upsertWatcherCursor } from "./db/sqlite.mjs";

const db = openAppDatabase(config.appStateDbPath);

const heartbeat = () => {
  const cursor = `heartbeat:${Date.now()}`;
  upsertWatcherCursor(db, "rpc-poller", cursor);
  const state = getWatcherCursor(db, "rpc-poller");
  console.log(
    JSON.stringify(
      {
        service: "prover-worker",
        cursor: state?.cursor ?? null,
        updatedAt: state?.updatedAt ?? null
      },
      null,
      2
    )
  );
};

heartbeat();
setInterval(heartbeat, 30000);

