import type { LoroMap, LoroTree } from "loro-crdt";
import { LoroDoc } from "loro-crdt";

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

export function create(name: string): Doc {
  const doc = new LoroDoc<Structure>();
  const meta = doc.getMap("meta");
  meta.set("name", name);
  return doc;
}

export function verify(doc: LoroDoc): asserts doc is Doc {
  const meta = doc.getMap("meta");

  if (typeof meta.get("name") !== "string") {
    throw Error("document meta is missing required property 'name'");
  }

  const main = doc.getTree("main");

  for (const node of main.getNodes()) {
    if (typeof node.data.get("label") !== "string") {
      throw Error("node data is missing required property 'data'");
    }
  }
}

export function read(file: File): Promise<Doc> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", (event) => {
      const buffer = event.target?.result;

      if (typeof buffer === "undefined" || buffer === null) return;

      const bytes = new Uint8Array(buffer as ArrayBuffer);
      const doc = new LoroDoc();

      try {
        doc.import(bytes);
        verify(doc);
        resolve(doc);
      } catch (error) {
        reject(error);
      }
    });

    reader.addEventListener("error", () => {
      reject(new Error("failed to read file"));
    });

    reader.readAsArrayBuffer(file);
  });
}
