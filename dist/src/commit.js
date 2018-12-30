"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const stringify = require("json-stable-stringify");
const generateHash = (input) => {
    return crypto
        .createHash("sha1")
        .update(stringify(input))
        .digest("hex");
};
exports.createCommit = (timeline, event, timestamp, payload, parent, thread, author) => {
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
exports.verifyCommit = (commit) => {
    return (commit.id ===
        generateHash({
            parent: commit.parent,
            timeline: commit.timeline,
            event: commit.event,
            timestamp: commit.timestamp,
            payload: commit.payload,
            thread: commit.thread,
            author: commit.author
        }));
};
//# sourceMappingURL=commit.js.map