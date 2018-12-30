"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const t = require("io-ts");
const PathReporter_1 = require("io-ts/lib/PathReporter");
const payload = require("./payload");
exports.decoder = t.type({
    event: t.string,
    thread: t.union([t.string, t.null]),
    payload: payload.decoder
});
exports.events = (data) => {
    const result = t.union([exports.decoder, t.array(exports.decoder)]).decode(data);
    if (result.isLeft()) {
        throw new Error(PathReporter_1.PathReporter.report(result).join("\n"));
    }
    else {
        return result.value instanceof Array ? result.value : [result.value];
    }
};
//# sourceMappingURL=event.js.map