import type { ComponentType, PropsWithChildren } from "react";
import type { FallbackProps } from "react-error-boundary";
import { ErrorBoundary as Boundary } from "react-error-boundary";

export type { FallbackProps };

export type ErrorBoundaryProps = PropsWithChildren<{
  fallback: ComponentType<FallbackProps>;
}>;

export function ErrorBoundary({ fallback, ...props }: ErrorBoundaryProps) {
  return <Boundary {...props} FallbackComponent={fallback} />;
}
