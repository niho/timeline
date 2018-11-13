import * as Bluebird from "bluebird";
import * as rabbot from "rabbot";
import { logger } from "./logger";

import * as changelog from "./changelog";
import { db } from "./db";

rabbot.rejectUnhandled();
rabbot.nackOnError();

rabbot.log({
  level: process.env.LOG_LEVEL || "info",
  stream: logger
});

rabbot.on("unreachable", () => {
  process.exit(1);
});

rabbot.handle("changelog.commit", (req: any) => {
  const datastore = changelog.defaultStore(db);
  const timeline = parseInt(req.properties.headers["x-timeline"], 10);
  const author = req.properties.headers["x-author"];
  const events = req.body;
  changelog.timeline(timeline, datastore)
           .commit(author, events)
           .tap((commits) =>
             Bluebird.each(commits, (_commit) =>
               rabbot.publish("changelog", {
                 routingKey: timeline.toString(),
                 type: _commit.event,
                 messageId: _commit.id,
                 headers: {
                   "x-commit-event": _commit.event,
                   "x-commit-parent": _commit.parent,
                   "x-commit-timeline": _commit.timeline.toString()
                 },
                 body: _commit,
                 persistent: true
               })))
           .then((commits) => {
              if (req.properties.replyTo) {
                req.reply(commits, { contentType: "application/json" });
              } else {
                req.ack();
              }
           })
           .catch((err: Error) => {
             logger.error(err.stack ? err.stack : err.message);
             req.nack();
           });
});

rabbot.handle("changelog.fetch", (req: any) => {
  const datastore = changelog.defaultStore(db);
  const timeline = req.properties.headers["x-timeline"];
  changelog.timeline(timeline, datastore)
           .fetch()
           .then((commits) => {
             req.reply(commits, { contentType: "application/json" });
           })
           .catch((err: Error) => {
             logger.error(err.stack ? err.stack : err.message);
             req.nack();
           });
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
    exchanges: [
      { name: "changelog", type: "topic", persistent: true }
    ],
    queues: [
      { name: "changelog.commit", subscribe: true },
      { name: "changelog.fetch", subscribe: true, messageTtl: 30 * 1000 }
    ]
  })
  .catch((err: Error) => {
    logger.error(err.stack ? err.stack : err.message);
  });
