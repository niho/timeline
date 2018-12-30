import * as _ from "lodash";
import { Commit, createCommit } from "./commit";
import { Event, events } from "./event";
import * as merkle from "./merkle";

export const commits = (
  timeline: string,
  data: Event[] | unknown,
  history: Commit[],
  author: string | null
): Commit[] => {
  const head = _.last(history);
  const _events = squash(events(data), head);
  return merkle.create(_events, history, (_event, parent) => {
    return createCommit(
      timeline,
      _event.event,
      new Date(),
      _event.payload,
      parent,
      _event.thread,
      author
    );
  });
};

const squash = (_events: Event[], parent?: Commit): Event[] => {
  const isEqual = (a: Event | Commit, b: Event | Commit) => {
    return (
      a.event === b.event &&
      a.thread === b.thread &&
      _.isEqual(a.payload, b.payload)
    );
  };
  return _.reduce(
    _events,
    (acc: Event[], e: Event) => {
      const prev = _.last(acc);
      if (_.isEmpty(acc) && parent && isEqual(e, parent)) {
        return acc;
      } else if (prev && isEqual(prev, e)) {
        return acc;
      } else {
        acc.push(e);
        return acc;
      }
    },
    []
  );
};

export const fetch = (
  _commits: Commit[],
  predicate?: _.ListIterateeCustom<Commit, boolean>
) =>
  predicate
    ? _.filter(merkle.sort(_commits), predicate)
    : merkle.sort(_commits);
