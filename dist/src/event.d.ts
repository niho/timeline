import * as t from "io-ts";
export declare const decoder: t.InterfaceType<{
    event: t.StringType;
    thread: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
    payload: t.UnionType<(t.NullType | t.StringType | t.NumberType | t.BooleanType | t.ObjectType)[], string | number | boolean | object | null, string | number | boolean | object | null, unknown>;
}, t.TypeOfProps<{
    event: t.StringType;
    thread: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
    payload: t.UnionType<(t.NullType | t.StringType | t.NumberType | t.BooleanType | t.ObjectType)[], string | number | boolean | object | null, string | number | boolean | object | null, unknown>;
}>, t.OutputOfProps<{
    event: t.StringType;
    thread: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
    payload: t.UnionType<(t.NullType | t.StringType | t.NumberType | t.BooleanType | t.ObjectType)[], string | number | boolean | object | null, string | number | boolean | object | null, unknown>;
}>, unknown>;
export declare type Event = t.TypeOf<typeof decoder>;
export declare const events: (data: unknown) => t.TypeOfProps<{
    event: t.StringType;
    thread: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
    payload: t.UnionType<(t.NullType | t.StringType | t.NumberType | t.BooleanType | t.ObjectType)[], string | number | boolean | object | null, string | number | boolean | object | null, unknown>;
}>[];
