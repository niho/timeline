import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import * as payload from "./payload";

export const decoder = t.type({
  event: t.string,
  thread: t.union([t.string, t.null]),
  payload: payload.decoder
});

export type Event = t.TypeOf<typeof decoder>;

export const events = (data: unknown): Event[] => {
  const result = t.union([decoder, t.array(decoder)]).decode(data);
  if (result.isLeft()) {
    throw new Error(PathReporter.report(result).join("\n"));
  } else {
    return result.value instanceof Array ? result.value : [result.value];
  }
};
