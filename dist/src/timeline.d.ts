import { Commit } from "./commit";
import { Event } from "./event";
import { Payload } from "./payload";
export declare type TimelineId = string;
export declare function timeline(id: TimelineId, history: Commit[]): Timeline;
export declare type Validation = (event: string, payload: Payload, history: Array<Commit | Event>, thread: string | null) => PromiseLike<any>;
declare class Timeline {
    private readonly id;
    private readonly history;
    private readonly validations;
    constructor(id: TimelineId, history: Commit[]);
    validate(func: Validation): Timeline;
    commit(author: null | string, data: unknown): Promise<Commit[]>;
    latest(_event: string): Promise<Payload | undefined>;
    all(_event: string): Promise<Payload[]>;
    fetch(_event?: string): Promise<Commit[]>;
    private validation;
}
export {};
