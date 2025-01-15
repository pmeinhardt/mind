import type { LoroMap, LoroTree } from "loro-crdt";
import { LoroDoc } from "loro-crdt";

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

export function create(name: string): LoroDoc<Structure> {
  const doc = new LoroDoc<Structure>();
  const meta = doc.getMap("meta");
  meta.set("name", name);
  return doc;
}

export function verify(doc: LoroDoc): asserts doc is LoroDoc<Structure> {
  // TODO: Verify document structure
  // const meta = doc.getMap("meta");
  // const main = doc.getTree("main");
}

export function read(file: File): Promise<LoroDoc<Structure>> {
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
