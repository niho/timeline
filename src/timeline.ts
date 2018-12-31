import * as Bluebird from "bluebird";
import * as _ from "lodash";
import { commits, fetch, verify } from "./changelog";
import { Commit } from "./commit";
import { Event, events } from "./event";

export type TimelineId = string;

export function timeline(id: TimelineId, history: Commit[]): Timeline {
  return new Timeline(id, history);
}

export type Validation = (
  event: Event,
  history: Array<Commit | Event>
) => PromiseLike<any>;

export class Timeline {
  private readonly id: TimelineId;
  private readonly history: Commit[];
  private readonly validations: Validation[];

  constructor(id: TimelineId, history: Commit[]) {
    if (typeof id !== "string" || id === "") {
      throw new TypeError("Argument id expected to be a string.");
    }
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

  public latest(event: string): Commit | undefined {
    return _.last(fetch(this.history, { event }));
  }

  public thread(thread: string): Commit[] {
    return fetch(this.history, { thread });
  }

  public author(author: string): Commit[] {
    return fetch(this.history, { author });
  }

  public all(event?: string): Commit[] {
    if (event) {
      return fetch(this.history, { event });
    } else {
      return fetch(this.history);
    }
  }

  private async validation(
    history: Array<Commit | Event>,
    event: Event
  ): Promise<Array<Commit | Event>> {
    const params = [event, history];
    return Bluebird.map(this.validations, f => _.spread(f)(params)).then(() =>
      _.concat(history, event)
    );
  }
}
