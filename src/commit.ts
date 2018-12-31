import * as crypto from "crypto";
import * as t from "io-ts";
import * as stringify from "json-stable-stringify";
import { Payload } from "./payload";

export interface Commit {
  timeline: string;
  id: string;
  parent: string | null;
  thread: string | null;
  author: string | null;
  event: string;
  timestamp: number;
  payload: Payload;
}

export const decoder = t.intersection([
  t.type({
    timeline: t.string,
    id: t.string,
    event: t.string,
    timestamp: t.number,
    payload: t.any
  }),
  t.partial({
    parent: t.union([t.string, t.null]),
    author: t.union([t.string, t.null]),
    thread: t.union([t.string, t.null])
  })
]);

export const createCommit = (
  timeline: string,
  event: string,
  timestamp: Date,
  payload: Payload,
  parent: string | null,
  thread: string | null,
  author: string | null
): Commit => {
  if (typeof timeline !== "string" || timeline === "") {
    throw new TypeError("Argument timeline expected to be a string.");
  }
  if (typeof event !== "string" || event === "") {
    throw new TypeError("Argument event expected to be a string.");
  }
  if (timestamp instanceof Date === false) {
    throw new TypeError("Argument timestamp expected to be a Date.");
  }
  if (payload === undefined) {
    throw new TypeError("Argument payload expected not to be undefined.");
  }
  if ((typeof parent !== "string" && parent !== null) || parent === "") {
    throw new TypeError("Argument parent expected to be a string or null.");
  }
  if ((typeof thread !== "string" && thread !== null) || thread === "") {
    throw new TypeError("Argument thread expected to be a string or null.");
  }
  if ((typeof author !== "string" && author !== null) || author === "") {
    throw new TypeError("Argument author expected to be a string or null.");
  }
  return {
    id: generateHash({
      parent,
      timeline,
      event,
      timestamp: timestamp.getTime(),
      payload,
      thread,
      author
    }),
    parent,
    thread,
    timeline,
    event,
    timestamp: timestamp.getTime(),
    payload,
    author
  };
};

export const verifyCommit = (commit: Commit): boolean => {
  return (
    decoder.is(commit) &&
    commit.id ===
      generateHash({
        parent: commit.parent,
        timeline: commit.timeline,
        event: commit.event,
        timestamp: commit.timestamp,
        payload: commit.payload,
        thread: commit.thread,
        author: commit.author
      })
  );
};

const generateHash = (input: any) => {
  return crypto
    .createHash("sha1")
    .update(stringify(input))
    .digest("hex");
};
