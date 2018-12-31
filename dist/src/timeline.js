"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
const _ = require("lodash");
const changelog_1 = require("./changelog");
const event_1 = require("./event");
function timeline(id, history) {
    return new Timeline(id, history);
}
exports.timeline = timeline;
class Timeline {
    constructor(id, history) {
        if (typeof id !== "string" || id === "") {
            throw new TypeError("Argument id expected to be a string.");
        }
        this.id = id;
        this.history = changelog_1.verify(history);
        this.validations = [];
    }
    validate(func) {
        this.validations.push(func);
        return this;
    }
    commit(author, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const _events = event_1.events(data);
            return Bluebird.reduce(_events, this.validation.bind(this), this.history).then(() => changelog_1.commits(this.id, _events, this.history, author));
        });
    }
    latest(event) {
        return _.last(changelog_1.fetch(this.history, { event }));
    }
    thread(thread) {
        return changelog_1.fetch(this.history, { thread });
    }
    author(author) {
        return changelog_1.fetch(this.history, { author });
    }
    all(event) {
        if (event) {
            return changelog_1.fetch(this.history, { event });
        }
        else {
            return changelog_1.fetch(this.history);
        }
    }
    validation(history, event) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = [event, history];
            return Bluebird.map(this.validations, f => _.spread(f)(params)).then(() => _.concat(history, event));
        });
    }
}
exports.Timeline = Timeline;
//# sourceMappingURL=timeline.js.map