import type { LoroDoc, LoroMap, LoroTree } from "loro-crdt";

export type Doc = LoroDoc<Structure>;

export type Structure = {
  main: LoroTree<Node>;
  meta: LoroMap<Meta>;
};

export type Node = {
  expanded?: boolean;
  label: string;
};

export type Meta = {
  name: string;
};
