import * as rabbot from "rabbot";
import { logger } from "./logger";
import * as changelog from "./changelog";

rabbot.rejectUnhandled();
rabbot.nackOnError();

rabbot.log({
  level: process.env.LOG_LEVEL || "info",
  stream: logger
});

rabbot.on("unreachable", () => {
  process.exit(1);
});

rabbot.handle("changelog.service", changelog.service);
rabbot.handle("changelog.something", changelog.something);

rabbot
  .configure({
    connection: {
      uri: process.env.AMQP_URL,
      clientProperties: {
        service: "changelog"
      },
      replyQueue: false
    },
    queues: [
      { name: "changelog.service", subscribe: true },
      { name: "changelog.something", subscribe: true }
    ]
  })
  .catch((err: Error) => {
    logger.error(err.stack ? err.stack : err.message);
  });
