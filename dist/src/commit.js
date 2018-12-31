"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const t = require("io-ts");
const stringify = require("json-stable-stringify");
exports.decoder = t.intersection([
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
    return (exports.decoder.is(commit) &&
        commit.id ===
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
const generateHash = (input) => {
    return crypto
        .createHash("sha1")
        .update(stringify(input))
        .digest("hex");
};
//# sourceMappingURL=commit.js.map