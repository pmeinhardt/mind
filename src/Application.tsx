import { Suspense, useCallback, useState } from "react";

import { DropZone } from "./DropZone";
import { Editor } from "./Editor";
import { ErrorBoundary } from "./ErrorBoundary";
import { ErrorFallback } from "./ErrorFallback";
import { Loading } from "./Loading";
import { Doc } from "./model";

export type ApplicationProps = Record<string, never>;

export function Application(_: ApplicationProps) {
  const [promise, init] = useState<Promise<Doc>>(() => {
    const doc = new Doc("Ideas"); // create a new, empty document
    return Promise.resolve(doc);
  });

  const load = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        const file = files[0]; // we expect one file, any additional files will be ignored
        const promise = Doc.read(file);
        init(promise);
      }
    },
    [init],
  );

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <Suspense fallback={<Loading />}>
        <DropZone action={load}>
          <Editor load={load} promise={promise} />
        </DropZone>
      </Suspense>
    </ErrorBoundary>
  );
}
