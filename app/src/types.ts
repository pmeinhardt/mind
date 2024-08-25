import type { LoroMap, LoroTree } from "loro-crdt";

export type Structure = {
  main: LoroTree<Node>;
  meta: LoroMap<Meta>;
};

export type Node = {
  expanded?: boolean;
  label?: string;
};

export type Meta = {
  name: string;
};
