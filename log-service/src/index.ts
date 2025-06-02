import Fastify from "fastify";
import { redis } from "./redis.ts";
import { RedisStreamEntry } from "./types.ts";
import cors from "@fastify/cors";

const allowedOrigins = ["http://localhost:3000", "https://zerodeploy.xyz"];

const app = Fastify();
await app.register(cors, {
  origin: allowedOrigins,
  methods: ["GET"],
});

app.get("/logs/:buildId", async (req, res) => {
  const buildId = (req.params as any).buildId;
  const streamKey = `logs:${buildId}`;
  let lastId = "0";

  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.raw.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.raw.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  res.raw.flushHeaders();

  const sendLog = (msg: string) => {
    res.raw.write(`data: ${msg}\n\n`);
  };

  try {
    while (!res.raw.writableEnded) {
      const entries = (await redis.xRead([{ key: streamKey, id: lastId }], {
        BLOCK: 10000,
        COUNT: 10,
      })) as RedisStreamEntry[] | null;

      if (entries) {
        for (const stream of entries) {
          for (const entry of stream.messages) {
            const msg = entry.message.message;
            lastId = entry.id;
            if (msg) sendLog(msg);
            if (msg === "Exiting build process...") {
              sendLog("__END__");
              res.raw.end();
              return;
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Redis read error:", err);
    res.raw.write(`data: Error fetching logs\n\n`);
    res.raw.end();
  }
});

async function start() {
  try {
    await redis.connect();
    console.log("Connected to Redis");
    await app.listen({ port: 5000, host: "0.0.0.0" });
    console.log("Log service is listening...");
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
}

start();
