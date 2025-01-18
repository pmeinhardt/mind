import type { LoroDoc } from "loro-crdt";
import { useState } from "react";

import { Editor } from "./Editor";
import { Launcher } from "./Launcher";
import type { Structure } from "./model";

export type Props = Record<string, never>;

export function Application(_: Props) {
  const [doc, setDoc] = useState<LoroDoc<Structure>>();
  if (doc) return <Editor doc={doc} />;
  return <Launcher onReady={setDoc} />;
}
