import * as Bluebird from "bluebird";
import * as _ from "lodash";
import { commits, fetch } from "./changelog";
import { Commit } from "./commit";
import { Event } from "./event";
import { Payload } from "./payload";
import * as topic from "./topic";

export type TimelineId = string;

export function timeline(id: TimelineId, db: Datastore): Timeline {
  return new Timeline(id, db);
}

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
    const _events = events instanceof Array ? events : [events];
    return this.fetch().then(history =>
      Bluebird.reduce(_events, this.validation.bind(this), history)
        .then(() =>
          this.db.insert(this.id, commits(this.id, _events, history, author))
        )
        .tap(_commits => topic.publish(_commits))
        .then(_commits => history.concat(_commits))
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
        .then(_commits => fetch(_commits, { event: _event }));
    } else {
      return this.db.fetch(this.id).then(fetch);
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
