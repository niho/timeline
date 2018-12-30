"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
exports.create = (items, history, func) => {
    return _.reduce(items, (nodes, item) => {
        const head = nodes.length === 0 ? _.last(history) : _.last(nodes);
        const parent = head ? head.id : null;
        return _.concat(nodes, func(item, parent));
    }, []);
};
exports.sort = (nodes, parent = null) => {
    const node = _.find(nodes, n => n.parent === parent);
    return node ? [node].concat(exports.sort(nodes, node.id)) : [];
};
exports.verify = (nodes, func) => _.reduce(exports.sort(nodes), (acc, node) => (func(node) ? acc : false), true);
//# sourceMappingURL=merkle.js.map