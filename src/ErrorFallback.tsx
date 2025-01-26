import type { FallbackProps } from "./ErrorBoundary";

export type ErrorFallbackProps = FallbackProps;

export function ErrorFallback({ error }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-8">
      <div className="-mt-2 w-full max-w-prose overflow-y-auto rounded-3xl border border-violet-200 bg-white px-14 py-12 shadow-2xl shadow-purple-800/5">
        <h2 className="mb-3 text-4xl font-semibold text-rose-500">Ooops!</h2>
        <p className="mb-2 text-lg font-extralight">An error occurred.</p>
        <p className="mb-2 text-sm font-extralight">
          If you have the time and energy, please check whether this is a known
          issue, and, if it is not, please open one so we can fix the problem.
        </p>
        <p className="mb-11 text-sm font-extralight">
          <a
            className="text-purple-600 underline"
            href="https://github.com/pmeinhardt/mind/issues"
          >
            https://github.com/pmeinhardt/mind/issues
          </a>
        </p>
        <pre className="text-xs text-stone-600">
          <code>
            {error instanceof Error ? error.toString() : JSON.stringify(error)}
          </code>
        </pre>
      </div>
    </div>
  );
}
