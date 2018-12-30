export interface Commit {
    timeline: string;
    id: string;
    parent: string | null;
    thread: string | null;
    author: null | string;
    event: string;
    timestamp: number;
    payload: any;
}
export declare const createCommit: (timeline: string, event: string, timestamp: Date, payload: any, parent: string | null, thread: string | null, author: string | null) => Commit;
export declare const verifyCommit: (commit: Commit) => boolean;
