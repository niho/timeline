import * as _ from "lodash";

interface Node {
  id: string;
  parent: string | null;
}

export const create = <T extends Node>(
  items: any[],
  history: T[],
  func: (item: any, parent: string | null) => T
): T[] => {
  return _.reduce(
    items,
    (nodes: T[], item: any) => {
      const head = nodes.length === 0 ? _.last(history) : _.last(nodes);
      const parent = head ? head.id : null;
      return _.concat(nodes, func(item, parent));
    },
    []
  );
};

export const sort = <T extends Node>(
  nodes: T[],
  parent: string | null = null
): T[] => {
  const node = _.find(nodes, n => n.parent === parent);
  return node ? [node].concat(sort(nodes, node.id)) : [];
};

export const verify = <T extends Node>(
  nodes: T[],
  func: (node: T) => boolean
): boolean =>
  _.reduce(sort(nodes), (acc, node) => (func(node) ? acc : false), true);
