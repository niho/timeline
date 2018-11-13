import * as rabbot from "rabbot";
import { logger } from "./logger";

import * as changelog from "./changelog";
import { defaultStore } from "./datastore";
import { db } from "./db";
import * as topic from "./topic";

rabbot.rejectUnhandled();
rabbot.nackOnError();

rabbot.log({
  level: process.env.LOG_LEVEL || "info",
  stream: logger
});

rabbot.on("unreachable", () => {
  process.exit(1);
});

rabbot.handle("changelog.commit", async (req: any) => {
  const datastore = defaultStore(db);
  const timeline = parseInt(req.properties.headers["x-timeline"], 10);
  const author = req.properties.headers["x-author"];
  const events = req.body;
  const commits = await changelog
    .timeline(timeline, datastore)
    .commit(author, events);
  await topic.publish(commits);
  if (req.properties.replyTo) {
    req.reply(commits, { contentType: "application/json" });
  } else {
    req.ack();
  }
});

rabbot.handle("changelog.fetch", async (req: any) => {
  const datastore = defaultStore(db);
  const timeline = req.properties.headers["x-timeline"];
  const commits = await changelog.timeline(timeline, datastore).fetch();
  req.reply(commits, { contentType: "application/json" });
});

rabbot
  .configure({
    connection: {
      uri: process.env.AMQP_URL,
      clientProperties: {
        service: "changelog"
      },
      replyQueue: false
    },
    exchanges: [{ name: "changelog", type: "topic", persistent: true }],
    queues: [
      { name: "changelog.commit", subscribe: true },
      { name: "changelog.fetch", subscribe: true, messageTtl: 30 * 1000 }
    ]
  })
  .catch((err: Error) => {
    logger.error(err.stack ? err.stack : err.message);
  });
