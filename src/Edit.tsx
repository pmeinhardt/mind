import { use } from "react";

import { Editor } from "./editing/Editor";
import type { Doc } from "./model";

export type EditProps = { promise: Promise<Doc> };

export function Edit({ promise }: EditProps) {
  const doc = use(promise);
  return <Editor doc={doc} />;
}
