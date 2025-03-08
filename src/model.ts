import type { LoroMap, LoroTree } from "loro-crdt";
import { LoroDoc } from "loro-crdt";

export class Doc extends LoroDoc<Structure> {
  static async read(file: File, signal?: AbortSignal): Promise<Doc> {
    signal?.throwIfAborted(); // throw immediately if the signal is already aborted

    const buffer = await file.arrayBuffer();

    signal?.throwIfAborted(); // throw if the signal was aborted while reading the file

    const bytes = new Uint8Array(buffer);
    const doc = new Doc();

    doc.import(bytes);
    verify(doc);

    return doc;
  }

  constructor(name?: string) {
    super();

    if (typeof name === "string") {
      this.meta.set("name", name);
    }
  }

  get main(): LoroTree<Node> {
    return this.getTree("main");
  }

  get meta(): LoroMap<Meta> {
    return this.getMap("meta");
  }
}

export function verify(doc: LoroDoc): asserts doc is Doc {
  const meta = doc.getMap("meta");

  if (typeof meta.get("name") !== "string") {
    throw Error("document meta is missing required property 'name'");
  }

  const main = doc.getTree("main");

  for (const node of main.getNodes()) {
    if (typeof node.data.get("label") !== "string") {
      throw Error("node data is missing required property 'label'");
    }
  }
}

export type Structure = {
  main: LoroTree<Node>;
  meta: LoroMap<Meta>;
};

export type Node = {
  expanded?: boolean;
  label: string;
};

export type Meta = {
  expanded?: boolean;
  name: string;
};
