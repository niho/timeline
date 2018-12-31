"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const commit_1 = require("./commit");
const event_1 = require("./event");
const merkle = require("./merkle");
exports.commits = (timeline, data, history, author) => {
    const head = _.last(history);
    const _events = squash(event_1.events(data), head);
    return merkle.create(_events, history, (_event, parent) => {
        return commit_1.createCommit(timeline, _event.event, new Date(), _event.payload, parent, _event.thread, author);
    });
};
const squash = (_events, parent) => {
    const isEqual = (a, b) => {
        return (a.event === b.event &&
            a.thread === b.thread &&
            _.isEqual(a.payload, b.payload));
    };
    return _.reduce(_events, (acc, e) => {
        const prev = _.last(acc);
        if (_.isEmpty(acc) && parent && isEqual(e, parent)) {
            return acc;
        }
        else if (prev && isEqual(prev, e)) {
            return acc;
        }
        else {
            acc.push(e);
            return acc;
        }
    }, []);
};
exports.fetch = (_commits, predicate) => predicate
    ? _.filter(merkle.sort(_commits), predicate)
    : merkle.sort(_commits);
exports.verify = (_commits) => merkle.verify(_commits, commit_1.verifyCommit) ? _commits : verifyFailed();
const verifyFailed = () => {
    throw new Error("integrity verification failed");
};
//# sourceMappingURL=changelog.js.map