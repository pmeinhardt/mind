import type { LoroMap, LoroTree } from "loro-crdt";
import { Loro } from "loro-crdt";

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

export function create(name: string): Loro<Structure> {
  const doc = new Loro<Structure>();
  const meta = doc.getMap("meta");
  meta.set("name", name);
  return doc;
}

export function verify(doc: Loro): asserts doc is Loro<Structure> {
  // TODO: Verify document structure
  // const meta = doc.getMap("meta");
  // const main = doc.getTree("main");
}

export function read(
  file: File,
  { signal }: { signal?: AbortSignal } = {},
): Promise<Loro<Structure>> {
  return new Promise((resolve, reject) => {
    if (signal && signal.aborted) {
      reject(signal.reason);
      return;
    }

    const reader = new FileReader();

    signal?.addEventListener("abort", () => {
      reader.abort();
      reject(signal.reason);
    });

    reader.addEventListener("load", (event) => {
      const buffer = event.target?.result;

      if (typeof buffer === "undefined" || buffer === null) return;

      const bytes = new Uint8Array(buffer as ArrayBuffer);
      const doc = new Loro();

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
