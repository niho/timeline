"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const t = require("io-ts");
exports.decoder = t.union([
    t.string,
    t.number,
    t.boolean,
    t.object,
    t.null
]);
//# sourceMappingURL=payload.js.map