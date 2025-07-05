import type { FallbackProps } from "./ErrorBoundary";

export type ErrorFallbackProps = FallbackProps;

export function ErrorFallback({ error }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-8">
      <div className="-mt-2 w-full max-w-prose overflow-y-auto rounded-xl border border-stone-200 bg-white p-14">
        <h2 className="mb-6 text-4xl font-semibold text-rose-500">
          Ooops!{" "}
          <span className="text-3xl font-medium text-rose-500">
            An error occurred.
          </span>
        </h2>
        <pre className="mb-6 text-sm text-stone-600">
          <code>
            {error instanceof Error ? error.toString() : JSON.stringify(error)}
          </code>
        </pre>
        <p className="mb-2 text-sm font-extralight">
          If you have the time and energy, please check whether this is a known
          issue, and, if it is not, please open one so we can fix the problem.
        </p>
        <p className="text-sm font-extralight">
          <a
            className="text-purple-600 underline"
            href="https://github.com/pmeinhardt/mind/issues"
          >
            https://github.com/pmeinhardt/mind/issues
          </a>
        </p>
      </div>
    </div>
  );
}
