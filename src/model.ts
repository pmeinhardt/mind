import type { Loro, LoroMap, LoroTree } from "loro-crdt";

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

export function verify(doc: Loro): asserts doc is Loro<Structure> {
  // TODO: Verify document structure
  // const meta = doc.getMap("meta");
  // const main = doc.getTree("main");
}
