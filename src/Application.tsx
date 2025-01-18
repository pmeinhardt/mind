import { useState } from "react";

import { Editor } from "./Editor";
import { Launcher } from "./Launcher";
import type { Doc } from "./model/types";

export type ApplicationProps = Record<string, never>;

export function Application(_: ApplicationProps) {
  const [doc, setDoc] = useState<Doc>();
  if (doc) return <Editor doc={doc} />;
  return <Launcher onReady={setDoc} />;
}
