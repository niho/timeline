import * as t from "io-ts";
export declare const decoder: t.InterfaceType<{
    event: t.StringType;
    thread: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
    payload: t.UnionType<(t.NullType | t.StringType | t.NumberType | t.BooleanType | t.ObjectType | t.ArrayType<t.StringType, string[], string[], unknown> | t.ArrayType<t.NumberType, number[], number[], unknown>)[], string | number | boolean | object | string[] | number[] | null, string | number | boolean | object | string[] | number[] | null, unknown>;
}, t.TypeOfProps<{
    event: t.StringType;
    thread: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
    payload: t.UnionType<(t.NullType | t.StringType | t.NumberType | t.BooleanType | t.ObjectType | t.ArrayType<t.StringType, string[], string[], unknown> | t.ArrayType<t.NumberType, number[], number[], unknown>)[], string | number | boolean | object | string[] | number[] | null, string | number | boolean | object | string[] | number[] | null, unknown>;
}>, t.OutputOfProps<{
    event: t.StringType;
    thread: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
    payload: t.UnionType<(t.NullType | t.StringType | t.NumberType | t.BooleanType | t.ObjectType | t.ArrayType<t.StringType, string[], string[], unknown> | t.ArrayType<t.NumberType, number[], number[], unknown>)[], string | number | boolean | object | string[] | number[] | null, string | number | boolean | object | string[] | number[] | null, unknown>;
}>, unknown>;
export declare type Event = t.TypeOf<typeof decoder>;
export declare const events: (data: unknown) => t.TypeOfProps<{
    event: t.StringType;
    thread: t.UnionType<(t.NullType | t.StringType)[], string | null, string | null, unknown>;
    payload: t.UnionType<(t.NullType | t.StringType | t.NumberType | t.BooleanType | t.ObjectType | t.ArrayType<t.StringType, string[], string[], unknown> | t.ArrayType<t.NumberType, number[], number[], unknown>)[], string | number | boolean | object | string[] | number[] | null, string | number | boolean | object | string[] | number[] | null, unknown>;
}>[];
