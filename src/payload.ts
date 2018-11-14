import * as t from "io-ts";

export const decoder = t.union([
  t.string,
  t.number,
  t.boolean,
  t.object,
  t.null
]);

export type Payload = t.TypeOf<typeof decoder>;
