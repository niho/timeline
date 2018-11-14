import * as t from "io-ts";
import * as payload from "./payload";

export const decoder = t.type({
  event: t.string,
  thread: t.union([t.string, t.null]),
  payload: payload.decoder
});

export const events = t.union([decoder, t.array(decoder)]);

export type Event = t.TypeOf<typeof decoder>;
