import { Suspense, useState } from "react";

import { Edit } from "./Edit";
import { ErrorBoundary } from "./ErrorBoundary";
import { ErrorFallback } from "./ErrorFallback";
import { Home } from "./Home";
import { Loading } from "./Loading";
import type { Doc } from "./model";

export type ApplicationProps = Record<string, never>;

export function Application(_: ApplicationProps) {
  const [promise, init] = useState<Promise<Doc> | null>(null);

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      {promise ? (
        <Suspense fallback={<Loading />}>
          <Edit promise={promise} />
        </Suspense>
      ) : (
        <Home init={init} />
      )}
    </ErrorBoundary>
  );
}
