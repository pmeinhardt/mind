import type { ReactNode } from "react";

export type LayoutProps = { children: ReactNode | undefined };

export function Layout({ children }: LayoutProps) {
  return <div className="relative h-dvh w-dvw">{children}</div>;
}

export type HeaderProps = { children: ReactNode | undefined };

export function Header({ children }: HeaderProps) {
  return (
    <div className="absolute top-0 right-0 left-0 flex items-center justify-center p-4">
      {children}
    </div>
  );
}

export type MainProps = { children: ReactNode | undefined };

export function Main({ children }: MainProps) {
  return <div className="h-full w-full">{children}</div>;
}
