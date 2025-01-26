import { Button } from "@headlessui/react";
import { DocumentArrowUpIcon, SparklesIcon } from "@heroicons/react/20/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import type { ChangeEvent, DragEvent } from "react";
import { useCallback, useEffect, useState } from "react";

import { create, read } from "./model/ops";
import type { Doc } from "./model/types";

export type HomeProps = { init: (doc: Promise<Doc>) => void };

export function Home({ init }: HomeProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (files.length > 0) {
      const file = files[0]; // we expect at most one file, any additional files will be ignored
      const promise = read(file);
      init(promise);
    }
  }, [files, init]);

  const onStartFresh = useCallback(() => {
    const doc = create("Ideas"); // create a new, empty document
    const promise = Promise.resolve(doc);
    init(promise);
  }, [init]);

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
      setFiles(Array.from(event.dataTransfer.files ?? []));
      setIsDragging(false);
    },
    [setFiles, setIsDragging],
  );

  const onFile = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target?.files ?? []);
      setFiles(files);
    },
    [setFiles],
  );

  return (
    <div
      className="flex min-h-dvh items-center justify-center px-6 py-8"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="-mt-2 max-w-prose overflow-y-auto rounded-3xl border border-violet-200 bg-white px-14 py-12 shadow-2xl shadow-purple-800/5">
        <h2 className="mb-3 bg-gradient-to-r from-purple-700 to-stone-600 to-70% bg-clip-text text-5xl font-semibold leading-tight text-transparent sm:to-30%">
          Mind
        </h2>
        <p className="mb-4 text-lg font-extralight text-stone-600">
          Invite friends. Collect ideas and shape them. Together.
        </p>
        <p className="mb-2 text-sm font-extralight leading-snug text-stone-600">
          You can begin with a blank canvas for a fresh start, or, upload an
          existing mind map to continue working on. Use the buttons below, or,
          drop your snapshot file into this window.
        </p>
        <p className="mb-11 text-sm font-extralight leading-snug text-stone-600">
          You can then invite people to collaborate and edit with you. Live.
        </p>
        <div className="mb-1 flex flex-col flex-wrap items-start gap-5 sm:flex-row sm:items-center sm:gap-3">
          <Button
            className="flex cursor-pointer items-center gap-1 text-nowrap rounded-full bg-purple-300/30 px-5 py-3 font-normal font-semibold text-purple-600 ring ring-purple-400/50 transition-colors duration-300 hover:bg-purple-500 hover:text-white hover:ring-purple-300"
            type="button"
            onClick={onStartFresh}
          >
            <SparklesIcon className="-ml-1 size-5" aria-hidden />
            Start from scratch
          </Button>
          <span className="hidden font-light text-stone-400 sm:block">or</span>
          <label
            className="flex cursor-pointer items-center gap-1 text-nowrap rounded-full bg-violet-300/30 px-5 py-3 font-normal font-semibold text-violet-600 ring ring-violet-400/50 transition-colors duration-300 hover:bg-violet-500 hover:text-white hover:ring-violet-300"
            htmlFor="file-input"
          >
            <DocumentArrowUpIcon className="-ml-0.5 size-5" aria-hidden />
            Open .mind file
          </label>
          <input
            id="file-input"
            className="sr-only"
            type="file"
            accept=".mind"
            onChange={onFile}
          />
        </div>
      </div>

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
