import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import type { DragEvent, PropsWithChildren } from "react";
import { useCallback, useState } from "react";

export type DropZoneProps = PropsWithChildren<{
  action: (files: File[]) => void;
}>;

export function DropZone({ children, action }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const onDragOver = useCallback(
    (event: DragEvent) => {
      event.stopPropagation();
      event.preventDefault();
      setIsDragging(true);
    },
    [setIsDragging],
  );

  const onDragLeave = useCallback(
    (event: DragEvent) => {
      event.stopPropagation();
      event.preventDefault();
      setIsDragging(false);
    },
    [setIsDragging],
  );

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.stopPropagation();
      event.preventDefault();
      action(Array.from(event.dataTransfer.files ?? []));
      setIsDragging(false);
    },
    [action, setIsDragging],
  );

  return (
    <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      {children}

      <div
        className={clsx(
          "fixed",
          "bottom-0",
          "left-0",
          "right-0",
          "top-0",
          "flex",
          "items-center",
          "justify-center",
          "bg-white/60",
          "backdrop-blur",
          !isDragging && "hidden",
        )}
      >
        <div className="flex items-center gap-2 rounded-full bg-violet-500 px-12 py-8 text-4xl font-semibold text-white ring-8 ring-violet-300">
          <ArrowDownTrayIcon className="-ml-1 size-8" aria-hidden />
          Drop to open
        </div>
      </div>
    </div>
  );
}
