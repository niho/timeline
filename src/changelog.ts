import * as Bluebird from "bluebird";
import * as t from "io-ts";
import * as _ from "lodash";
import { Commit, createCommit } from "./commit";
import * as merkle from "./merkle";

export type TimelineId = number;

export const payload = t.union([
  t.string,
  t.number,
  t.boolean,
  t.object,
  t.null
]);

export const event = t.type({
  event: t.string,
  thread: t.union([t.string, t.null]),
  payload
});

export type Event = t.TypeOf<typeof event>;

export type Payload = t.TypeOf<typeof payload>;

export type Validation = (
  event: string,
  payload: Payload,
  history: Array<Commit | Event>,
  thread: string | null
) => PromiseLike<any>;

export interface Datastore {
  fetch: (timeline: TimelineId) => PromiseLike<Commit[]>;
  insert: (timeline: TimelineId, commits: Commit[]) => PromiseLike<Commit[]>;
}

export function timeline(id: TimelineId, db: Datastore): Timeline {
  return new Timeline(id, db);
}

export const commits = (
  _timeline: TimelineId,
  events: Event[],
  history: Commit[],
  author: string | null
): Commit[] => {
  const head = _.last(history);
  const $events = squash(events, head);
  return merkle.create($events, history, (_event, parent) => {
    return createCommit(
      _timeline,
      _event.event,
      new Date(),
      _event.payload,
      parent,
      _event.thread,
      author
    );
  });
};

const squash = (events: Event[], parent?: Commit): Event[] => {
  const isEqual = (a: Event | Commit, b: Event | Commit) => {
    return (
      a.event === b.event &&
      a.thread === b.thread &&
      _.isEqual(a.payload, b.payload)
    );
  };
  return _.reduce(
    events,
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

class Timeline {
  private readonly id: TimelineId;
  private readonly db: Datastore;
  private readonly validations: Validation[];

  constructor(id: TimelineId, db: Datastore) {
    this.id = id;
    this.db = db;
    this.validations = [];
  }

  public validate(func: Validation): Timeline {
    this.validations.push(func);
    return this;
  }

  public async commit(
    author: null | string,
    events: Event[] | Event
  ): Promise<Commit[]> {
    const $events = events instanceof Array ? events : [events];
    return this.fetch().then(history =>
      Bluebird.reduce($events, this.validation.bind(this), history)
        .then(() =>
          this.db.insert(this.id, commits(this.id, $events, history, author))
        )
        .then($commits => history.concat($commits))
    );
  }

  public async latest(_event: string): Promise<Payload | undefined> {
    return this.fetch(_event).then((_commits: Commit[]) => {
      const commit = _.last(_commits);
      return commit ? commit.payload : undefined;
    });
  }

  public async all(_event: string): Promise<Payload[]> {
    return this.fetch(_event).then(_commits => _.map(_commits, c => c.payload));
  }

  public async fetch(_event?: string): Promise<Commit[]> {
    if (_event) {
      return this.db
        .fetch(this.id)
        .then(_commits => _.filter(_commits, { event: _event }))
        .then(merkle.sort);
    } else {
      return this.db.fetch(this.id).then(merkle.sort);
    }
  }

  private async validation(
    history: Array<Commit | Event>,
    e: Event
  ): Promise<Array<Commit | Event>> {
    const params = [e.event, e.payload, history, e.thread];
    return Bluebird.map(this.validations, f => _.spread(f)(params)).then(() =>
      _.concat(history, e)
    );
  }
}
