import * as _ from "lodash";
import { Commit } from "./commit";
export declare const commits: (timeline: string, data: unknown, history: Commit[], author: string | null) => Commit[];
export declare const fetch: (_commits: Commit[], predicate?: string | number | symbol | [string | number | symbol, any] | _.ListIterator<Commit, boolean> | _.PartialDeep<Commit> | undefined) => Commit[];
