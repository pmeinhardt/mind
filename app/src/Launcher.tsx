import { DocumentArrowUpIcon, SparklesIcon } from "@heroicons/react/20/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Loro } from "loro-crdt";
import type { ChangeEvent, DragEvent } from "react";
import { useCallback, useState } from "react";

import type { Structure } from "./model";
import read from "./read";

export type Props = { onReady: (doc: Loro<Structure>) => void };

function Launcher({ onReady }: Props) {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const createNewDoc = useCallback(() => {
    const doc = new Loro<Structure>();
    const meta = doc.getMap("meta");
    meta.set("name", "Topic");
    onReady(doc);
  }, [onReady]);

  const readDocFromFile = useCallback(
    async (file: File) => {
      try {
        onReady(await read(file));
      } catch (error) {
        console.log(error); // TODO: Inform user about error
      }
    },
    [onReady],
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback((event: DragEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.stopPropagation();
      event.preventDefault();

      const files = Array.from(event.dataTransfer.files ?? []);
      const file = files[0]; // we expect at most one file, any additional files will be ignored

      if (file) readDocFromFile(file);

      setIsDragging(false);
    },
    [readDocFromFile],
  );

  const onFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target?.files?.[0];
      if (file) readDocFromFile(file);
    },
    [readDocFromFile],
  );

  return (
    <div
      className="flex h-dvh w-dvw items-center justify-center p-6"
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragLeave={onDragEnd}
      onDrop={onDrop}
    >
      <div className="max-w-prose overflow-y-auto rounded-3xl border-4 border-violet-400/40 bg-white p-12 shadow-lg shadow-purple-800/5">
        <h2 className="mb-3 bg-gradient-to-r from-purple-700 to-stone-600 bg-clip-text text-5xl font-semibold leading-tight text-transparent">
          Mind+Map+Live.
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
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="flex cursor-pointer items-center gap-1 text-nowrap rounded-full bg-purple-300/30 px-5 py-3 font-normal font-semibold text-purple-600 ring ring-purple-400/50 transition-colors duration-300 hover:bg-purple-500 hover:text-white hover:ring-purple-300"
            type="button"
            onClick={createNewDoc}
          >
            <SparklesIcon className="-ml-1 size-5" aria-hidden />
            Start from scratch
          </button>
          <span className="font-light text-stone-400">or</span>
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
            onChange={onFileChange}
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
          "bg-violet-800/60",
          "backdrop-blur",
          !isDragging && "hidden",
        )}
      >
        <div className="flex items-center gap-2 rounded-full bg-purple-800/40 px-12 py-8 text-4xl font-semibold text-white ring-4 ring-purple-100/90">
          <ArrowDownTrayIcon className="-ml-1 size-8" aria-hidden />
          Let go to upload
        </div>
      </div>
    </div>
  );
}

export default Launcher;
