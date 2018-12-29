import * as AWS from "aws-sdk";
import { PathReporter } from "io-ts/lib/PathReporter";
import * as rabbot from "rabbot";

import { defaultStore } from "./datastore";
import * as event from "./event";
import { logger } from "./logger";
import { timeline } from "./timeline";

const dynamodb = new AWS.DynamoDB({
  endpoint: process.env.DYNAMODB_ENDPOINT
});

defaultStore(dynamodb)
  .then(datastore => {
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
      try {
        const id = req.properties.headers["x-timeline"];
        const author = req.properties.headers["x-author"];
        const events = event.events.decode(req.body);
        if (events.isLeft()) {
          throw new Error(PathReporter.report(events).join("\n"));
        } else {
          const _events = events.value;
          const commits = await timeline(id, datastore).commit(author, _events);
          logger.info(JSON.stringify(commits));
          if (req.properties.replyTo) {
            req.reply(commits, { contentType: "application/json" });
          } else {
            req.ack();
          }
        }
      } catch (err) {
        logger.error(err.stack ? err.stack : err.message);
        req.nack();
      }
    });

    rabbot.handle("changelog.fetch", async (req: any) => {
      try {
        const id = req.properties.headers["x-timeline"];
        const commits = await timeline(id, datastore).fetch();
        logger.info(JSON.stringify(commits));
        req.reply(commits, { contentType: "application/json" });
      } catch (err) {
        logger.error(err.stack ? err.stack : err.message);
        req.nack();
      }
    });

    return rabbot.configure({
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
    });
  })
  .catch((err: Error) => {
    logger.error(err.stack ? err.stack : err.message);
  });
