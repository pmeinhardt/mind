import { Loro } from "loro-crdt";

import type { Structure } from "./model";
import { verify } from "./model";

function read(file: File): Promise<Loro<Structure>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

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

    reader.readAsArrayBuffer(file);
  });
}

export default read;
