import * as t from "io-ts";
export declare const decoder: t.UnionType<(t.NullType | t.StringType | t.NumberType | t.BooleanType | t.ObjectType | t.ArrayType<t.StringType, string[], string[], unknown> | t.ArrayType<t.NumberType, number[], number[], unknown>)[], string | number | boolean | object | string[] | number[] | null, string | number | boolean | object | string[] | number[] | null, unknown>;
export declare type Payload = t.TypeOf<typeof decoder>;
