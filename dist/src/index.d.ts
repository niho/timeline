import * as _commit from "./commit";
import * as _event from "./event";
import * as _payload from "./payload";
import * as _timeline from "./timeline";
export declare type Event = _event.Event;
export declare type Commit = _commit.Commit;
export declare type Payload = _payload.Payload;
export declare const timeline: typeof _timeline.timeline;
export declare const event: {
    decoder: import("io-ts").InterfaceType<{
        event: import("io-ts").StringType;
        thread: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType)[], string | null, string | null, unknown>;
        payload: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType | import("io-ts").NumberType | import("io-ts").BooleanType | import("io-ts").ObjectType | import("io-ts").ArrayType<import("io-ts").StringType, string[], string[], unknown> | import("io-ts").ArrayType<import("io-ts").NumberType, number[], number[], unknown>)[], string | number | boolean | object | string[] | number[] | null, string | number | boolean | object | string[] | number[] | null, unknown>;
    }, import("io-ts").TypeOfProps<{
        event: import("io-ts").StringType;
        thread: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType)[], string | null, string | null, unknown>;
        payload: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType | import("io-ts").NumberType | import("io-ts").BooleanType | import("io-ts").ObjectType | import("io-ts").ArrayType<import("io-ts").StringType, string[], string[], unknown> | import("io-ts").ArrayType<import("io-ts").NumberType, number[], number[], unknown>)[], string | number | boolean | object | string[] | number[] | null, string | number | boolean | object | string[] | number[] | null, unknown>;
    }>, import("io-ts").OutputOfProps<{
        event: import("io-ts").StringType;
        thread: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType)[], string | null, string | null, unknown>;
        payload: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType | import("io-ts").NumberType | import("io-ts").BooleanType | import("io-ts").ObjectType | import("io-ts").ArrayType<import("io-ts").StringType, string[], string[], unknown> | import("io-ts").ArrayType<import("io-ts").NumberType, number[], number[], unknown>)[], string | number | boolean | object | string[] | number[] | null, string | number | boolean | object | string[] | number[] | null, unknown>;
    }>, unknown>;
    events: (data: unknown) => import("io-ts").TypeOfProps<{
        event: import("io-ts").StringType;
        thread: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType)[], string | null, string | null, unknown>;
        payload: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType | import("io-ts").NumberType | import("io-ts").BooleanType | import("io-ts").ObjectType | import("io-ts").ArrayType<import("io-ts").StringType, string[], string[], unknown> | import("io-ts").ArrayType<import("io-ts").NumberType, number[], number[], unknown>)[], string | number | boolean | object | string[] | number[] | null, string | number | boolean | object | string[] | number[] | null, unknown>;
    }>[];
};
export declare const commit: {
    decoder: import("io-ts").IntersectionType<[import("io-ts").InterfaceType<{
        timeline: import("io-ts").StringType;
        id: import("io-ts").StringType;
        event: import("io-ts").StringType;
        timestamp: import("io-ts").NumberType;
        payload: import("io-ts").AnyType;
    }, import("io-ts").TypeOfProps<{
        timeline: import("io-ts").StringType;
        id: import("io-ts").StringType;
        event: import("io-ts").StringType;
        timestamp: import("io-ts").NumberType;
        payload: import("io-ts").AnyType;
    }>, import("io-ts").OutputOfProps<{
        timeline: import("io-ts").StringType;
        id: import("io-ts").StringType;
        event: import("io-ts").StringType;
        timestamp: import("io-ts").NumberType;
        payload: import("io-ts").AnyType;
    }>, unknown>, import("io-ts").PartialType<{
        parent: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType)[], string | null, string | null, unknown>;
        author: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType)[], string | null, string | null, unknown>;
        thread: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType)[], string | null, string | null, unknown>;
    }, import("io-ts").TypeOfPartialProps<{
        parent: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType)[], string | null, string | null, unknown>;
        author: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType)[], string | null, string | null, unknown>;
        thread: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType)[], string | null, string | null, unknown>;
    }>, import("io-ts").OutputOfPartialProps<{
        parent: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType)[], string | null, string | null, unknown>;
        author: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType)[], string | null, string | null, unknown>;
        thread: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType)[], string | null, string | null, unknown>;
    }>, unknown>], import("io-ts").Compact<import("io-ts").TypeOfProps<{
        timeline: import("io-ts").StringType;
        id: import("io-ts").StringType;
        event: import("io-ts").StringType;
        timestamp: import("io-ts").NumberType;
        payload: import("io-ts").AnyType;
    }> & import("io-ts").TypeOfPartialProps<{
        parent: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType)[], string | null, string | null, unknown>;
        author: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType)[], string | null, string | null, unknown>;
        thread: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType)[], string | null, string | null, unknown>;
    }>>, import("io-ts").Compact<import("io-ts").OutputOfProps<{
        timeline: import("io-ts").StringType;
        id: import("io-ts").StringType;
        event: import("io-ts").StringType;
        timestamp: import("io-ts").NumberType;
        payload: import("io-ts").AnyType;
    }> & import("io-ts").OutputOfPartialProps<{
        parent: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType)[], string | null, string | null, unknown>;
        author: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType)[], string | null, string | null, unknown>;
        thread: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType)[], string | null, string | null, unknown>;
    }>>, unknown>;
};
export declare const payload: {
    decoder: import("io-ts").UnionType<(import("io-ts").NullType | import("io-ts").StringType | import("io-ts").NumberType | import("io-ts").BooleanType | import("io-ts").ObjectType | import("io-ts").ArrayType<import("io-ts").StringType, string[], string[], unknown> | import("io-ts").ArrayType<import("io-ts").NumberType, number[], number[], unknown>)[], string | number | boolean | object | string[] | number[] | null, string | number | boolean | object | string[] | number[] | null, unknown>;
};
