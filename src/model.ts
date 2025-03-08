import type { LoroMap, LoroTree } from "loro-crdt";
import { LoroDoc } from "loro-crdt";

export class Doc extends LoroDoc<Structure> {
  static async read(file: File): Promise<Doc> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.addEventListener("load", (event) => {
        const buffer = event.target?.result;

        if (typeof buffer === "undefined" || buffer === null) return;

        const bytes = new Uint8Array(buffer as ArrayBuffer);
        const doc = new Doc();

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
