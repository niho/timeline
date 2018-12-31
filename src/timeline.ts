import * as Bluebird from "bluebird";
import * as _ from "lodash";
import { commits, fetch, verify } from "./changelog";
import { Commit } from "./commit";
import { Event, events } from "./event";
import { Payload } from "./payload";

export type TimelineId = string;

export function timeline(id: TimelineId, history: Commit[]): Timeline {
  return new Timeline(id, history);
}

export type Validation = (
  event: string,
  payload: Payload,
  history: Array<Commit | Event>,
  thread: string | null
) => PromiseLike<any>;

class Timeline {
  private readonly id: TimelineId;
  private readonly history: Commit[];
  private readonly validations: Validation[];

  constructor(id: TimelineId, history: Commit[]) {
    this.id = id;
    this.history = verify(history);
    this.validations = [];
  }

  public validate(func: Validation): Timeline {
    this.validations.push(func);
    return this;
  }

  public async commit(author: null | string, data: unknown): Promise<Commit[]> {
    const _events = events(data);
    return Bluebird.reduce(
      _events,
      this.validation.bind(this),
      this.history
    ).then(() => commits(this.id, _events, this.history, author));
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
      return fetch(this.history, { event: _event });
    } else {
      return fetch(this.history);
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
