import * as crypto from "crypto";
import * as stringify from "json-stable-stringify";

export interface Commit {
  id: string;
  parent: string | null;
  thread: string | null;
  timeline: number;
  event: string;
  timestamp: Date;
  payload: any;
  author: null | string;
}

const generateHash = (input: any) => {
  return crypto
    .createHash("sha1")
    .update(stringify(input))
    .digest("hex");
};

export const createCommit = (
  timeline: number,
  event: string,
  timestamp: Date,
  payload: any,
  parent: string | null,
  thread: string | null,
  author: string | null
): Commit => {
  if (typeof timeline !== "number" || timeline <= 0) {
    throw new TypeError("Argument timeline expected to be a number.");
  }
  if (typeof event !== "string" || event === "") {
    throw new TypeError("Argument event expected to be a string.");
  }
  if (timestamp instanceof Date === false) {
    throw new TypeError("Argument createdAt expected to be a Date.");
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
      timestamp,
      payload,
      thread,
      author
    }),
    parent,
    thread,
    timeline,
    event,
    timestamp,
    payload,
    author
  };
};

export const verifyCommit = (commit: Commit): boolean => {
  return (
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
