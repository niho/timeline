import { logger } from "./logger";

export const service = (req: any) => {
  req.reply("hello world");
};

export const something = (req: any) => {
  logger.info(req.body);
  req.ack();
};
