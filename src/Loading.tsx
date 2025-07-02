export type LoadingProps = { message?: string };

export function Loading({ message = "Loading..." }: LoadingProps) {
  return (
    <div className="fixed top-0 right-0 bottom-0 left-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
      <div className="flex items-center gap-2 rounded-full px-12 py-8 text-4xl font-semibold text-violet-500">
        <svg
          className="mr-3 -ml-1 size-8 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          focusable="false"
          aria-hidden
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {message}
      </div>
    </div>
  );
}
