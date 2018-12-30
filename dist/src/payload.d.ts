import * as t from "io-ts";
export declare const decoder: t.UnionType<(t.NullType | t.StringType | t.NumberType | t.BooleanType | t.ObjectType)[], string | number | boolean | object | null, string | number | boolean | object | null, unknown>;
export declare type Payload = t.TypeOf<typeof decoder>;
