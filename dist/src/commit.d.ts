import * as t from "io-ts";
import { Payload } from "./payload";
export interface Commit {
    timeline: string;
    id: string;
    parent: string | null;
    thread: string | null;
    author: string | null;
    event: string;
    timestamp: number;
    payload: Payload;
}
export declare const decoder: t.IntersectionType<[t.InterfaceType<{
    timeline: t.StringType;
    id: t.StringType;
    event: t.StringType;
    timestamp: t.NumberType;
    payload: t.AnyType;
}, t.TypeOfProps<{
    timeline: t.StringType;
    id: t.StringType;
    event: t.StringType;
    timestamp: t.NumberType;
    payload: t.AnyType;
}>, t.OutputOfProps<{
    timeline: t.StringType;
    id: t.StringType;
    event: t.StringType;
    timestamp: t.NumberType;
    payload: t.AnyType;
}>, unknown>, t.PartialType<{
    parent: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
    author: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
    thread: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
}, t.TypeOfPartialProps<{
    parent: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
    author: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
    thread: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
}>, t.OutputOfPartialProps<{
    parent: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
    author: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
    thread: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
}>, unknown>], t.Compact<t.TypeOfProps<{
    timeline: t.StringType;
    id: t.StringType;
    event: t.StringType;
    timestamp: t.NumberType;
    payload: t.AnyType;
}> & t.TypeOfPartialProps<{
    parent: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
    author: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
    thread: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
}>>, t.Compact<t.OutputOfProps<{
    timeline: t.StringType;
    id: t.StringType;
    event: t.StringType;
    timestamp: t.NumberType;
    payload: t.AnyType;
}> & t.OutputOfPartialProps<{
    parent: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
    author: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
    thread: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
}>>, unknown>;
export declare const createCommit: (timeline: string, event: string, timestamp: Date, payload: string | number | boolean | object | string[] | number[] | null, parent: string | null, thread: string | null, author: string | null) => Commit;
export declare const verifyCommit: (commit: Commit) => boolean;
