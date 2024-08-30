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
      <div className="max-w-prose overflow-y-auto rounded-3xl border bg-white p-8">
        <h2 className="mb-3 text-3xl font-semibold text-zinc-800">
          Live mind-mapping
        </h2>
        <p className="mb-4 text-lg font-thin text-zinc-400">
          Invite friends. Collect ideas and shape them. Together.
        </p>
        <p className="mb-2 text-sm font-thin text-zinc-400">
          You can begin with a blank canvas for a fresh start, or, upload an
          existing mind map to continue working on. Use the buttons below, or,
          drop your snapshot file into this window.
        </p>
        <p className="mb-10 text-sm font-thin text-zinc-400">
          You can then invite people to collaborate and edit with you. Live.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="flex items-center gap-1 text-nowrap rounded-lg bg-emerald-300/30 px-3 py-2 font-normal text-emerald-600 transition-colors hover:bg-emerald-500/90 hover:text-white"
            type="button"
            onClick={createNewDoc}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="-ml-1 size-5"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
              />
            </svg>
            Start from scratch
          </button>
          <span className="font-light text-zinc-800">or</span>
          <label
            className="flex cursor-pointer items-center gap-1 text-nowrap rounded-lg bg-blue-300/30 px-3 py-2 font-normal text-blue-600 transition-colors hover:bg-blue-500/90 hover:text-white"
            htmlFor="file-input"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
            Upload an existing state
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
          "gap-2",
          "bg-violet-800/60",
          "text-white",
          "backdrop-blur",
          !isDragging && "hidden",
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        <p className="text-4xl font-semibold">Let go to upload</p>
      </div>
    </div>
  );
}

export default Launcher;
