import { DocumentArrowUpIcon, SparklesIcon } from "@heroicons/react/20/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Loro } from "loro-crdt";
import type { ChangeEvent, DragEvent } from "react";
import { useCallback, useEffect, useState } from "react";

import * as config from "./config";
import type { Structure } from "./model";
import { create, read } from "./model";
import { GuestSession } from "./sessions";

export type Props = {
  onReady: (state: { doc: Loro<Structure>; session?: GuestSession }) => void;
};

export function Launcher({ onReady }: Props) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [file, setFile] = useState<File>();

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      if (file) {
        try {
          setIsBusy(true);
          const doc = await read(file, { signal: controller.signal });
          setIsBusy(false);
          onReady({ doc });
        } catch (error) {
          setIsBusy(false);
          console.error(error);
          alert(error?.toString()); // TODO: Improve user feedback
        }
      }
    })();

    return () => controller.abort();
  }, [file]);

  const onStartFresh = useCallback(() => {
    const doc = create("Ideas");
    onReady({ doc });
  }, [onReady]);

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
      const files = Array.from(event.dataTransfer.files ?? []);
      setFile(files[0]); // we expect at most one file, any additional files will be ignored
      setIsDragging(false);
    },
    [setFile, setIsDragging],
  );

  const onFile = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target?.files ?? []);
      setFile(files[0]); // we expect at most one file, any additional files will be ignored
    },
    [setFile],
  );

  useEffect(() => {
    const hash = location.hash.replace(/^#/, "");

    if (hash.startsWith("join:") && hash.length > 5) {
      const remote = hash.substring(5);

      const session = new GuestSession(config.session, remote);
      const doc = create("");

      setIsBusy(true);

      session.on("ready", (id) => {
        console.debug(`session ${id} ready`);
      });

      session.on("data", (bytes) => {
        try {
          doc.import(bytes);
          setIsBusy(false);
          onReady({ doc, session });
        } catch (error) {
          setIsBusy(false);
          console.error(error);
          alert(error?.toString()); // TODO: Improve user feedback
        }
      });

      // session.on("close", () => {
      //   setIsBusy(false);
      // });

      return () => session.close();
    }

    return () => {};
  }, [location]);

  return (
    <div
      className="flex h-dvh w-dvw items-center justify-center p-6"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
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
            onClick={onStartFresh}
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
            onChange={onFile}
          />
        </div>
      </div>

      {/* TODO: Add GitHub link */}

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
          Drop to open
        </div>
      </div>
    </div>
  );
}
