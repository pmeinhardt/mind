import type { Loro } from "loro-crdt";
import { useState } from "react";

import { Editor } from "./Editor";
import { Launcher } from "./Launcher";
import type { Structure } from "./model";

export type Props = never;

export function Application(/* {}: Props */) {
  const [doc, setDoc] = useState<Loro<Structure>>();
  if (doc) return <Editor doc={doc} />;
  return <Launcher onReady={setDoc} />;
}
