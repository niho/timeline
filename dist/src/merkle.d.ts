interface Node {
    id: string;
    parent: string | null;
}
export declare const create: <T extends Node>(items: any[], history: T[], func: (item: any, parent: string | null) => T) => T[];
export declare const sort: <T extends Node>(nodes: T[], parent?: string | null) => T[];
export declare const verify: <T extends Node>(nodes: T[], func: (node: T) => boolean) => boolean;
export {};
