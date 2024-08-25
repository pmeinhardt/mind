import type { VersionVector } from "loro-crdt";
import { Loro } from "loro-crdt";
import { StrictMode, useEffect, useMemo, useState } from "react";

import Canvas from "./Canvas";
import download from "./download";
import type { Structure } from "./types";

export type Props = object;

function Application(/* {}: Props */) {
  const doc = useMemo(() => {
    const loro = new Loro<Structure>();

    const meta = loro.getMap("meta");
    meta.set("name", "Topic");

    return loro;
  }, []);

  const channel = useMemo(() => new BroadcastChannel("sync"), []);

  useEffect(() => () => channel.close(), [channel]);

  const [vector, setVector] = useState<string>();

  // Send updates to peers

  useEffect(() => {
    let last: VersionVector | undefined = undefined;

    const subscription = doc.subscribe((event) => {
      console.log("doc event", event);

      const vv = Object.fromEntries(doc.version().toJSON());
      const v = Object.entries(vv)
        .map(([key, value]) => `${key}:${value}`)
        .join(" ");

      setVector(v);

      if (event.by === "local") {
        const bytes = doc.exportFrom(last);
        last = doc.version();
        channel.postMessage(bytes);
      }
    });

    return () => doc.unsubscribe(subscription);
  }, [doc, channel]);

  // Receive updates from peers

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      console.log("channel event", event);
      const bytes = new Uint8Array(event.data);
      doc.import(bytes);
    };

    channel.addEventListener("message", handler);

    return () => channel.removeEventListener("message", handler);
  }, [doc, channel]);

  const meta = useMemo(() => doc.getMap("meta"), [doc]);

  // TODO: Add error boundary

  return (
    <StrictMode>
      <div className="h-dvh w-dvw p-4">
        <div className="flex h-full w-full flex-col gap-4">
          <div className="flex grow-0 items-center justify-between rounded-xl border border-zinc-200 bg-white p-2 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="relative">
                <h1 className="px-3 py-2 font-semibold">{meta.get("name")}</h1>
                <button
                  className="absolute bottom-0 left-0 right-0 top-0 overflow-hidden rounded-lg bg-transparent hover:bg-zinc-400/20"
                  type="button"
                  onClick={() => {
                    const name = prompt("New name", meta.get("name"));
                    if (typeof name !== "string" || name.length === 0) return;
                    meta.set("name", name);
                    doc.commit();
                  }}
                >
                  <span className="sr-only">Edit title</span>
                </button>
              </div>
              <ul className="flex items-center gap-1">
                <li>
                  <button
                    className="flex items-center rounded-lg px-3 py-2 font-normal text-zinc-300 transition-colors hover:bg-blue-300/30 hover:text-blue-600"
                    type="button"
                    onClick={() => {
                      const bytes = doc.exportSnapshot();
                      const mime = "application/octet-stream";
                      const filename = `${meta.get("name").toLowerCase()}.mind`;
                      download([bytes], mime, filename);
                    }}
                  >
                    Download
                  </button>
                </li>
                <li>
                  <a
                    className="flex items-center rounded-lg px-3 py-2 font-normal text-zinc-300 transition-colors hover:bg-blue-300/30 hover:text-blue-600"
                    href="#"
                  >
                    Help
                  </a>
                </li>
                <li>
                  {vector && (
                    <span
                      className="ml-2 flex items-center text-nowrap rounded-md bg-emerald-200/40 px-2 py-1 text-xs text-emerald-400"
                      title={vector}
                    >
                      {vector.substring(0, 4)}…
                    </span>
                  )}
                </li>
              </ul>
            </div>
            <div className="flex items-center">
              <ul className="flex gap-1">
                <li>
                  <a
                    className="flex items-center gap-2 rounded-lg px-3 py-2 font-normal text-zinc-300 transition-colors hover:bg-blue-300/30 hover:text-blue-600"
                    href="#"
                  >
                    <span className="">Collaborate</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="-mx-1 size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
                      />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="grow">
            <Canvas doc={doc} vector={vector} />
          </div>
        </div>
      </div>
    </StrictMode>
  );
}

export default Application;
