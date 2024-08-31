import { BoltIcon } from "@heroicons/react/24/outline";
import { isString } from "@sindresorhus/is";
import type { VersionVector } from "loro-crdt";
import { Loro } from "loro-crdt";
import { StrictMode, useEffect, useMemo, useState } from "react";

import Canvas from "./Canvas";
import download from "./download";
import type { Structure } from "./model";

export type Props = { doc: Loro<Structure> };

function Application({ doc }: Props) {
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
          <div className="flex grow-0 items-center justify-between rounded-xl border-4 border-violet-200/60 bg-white p-2 shadow-sm shadow-violet-800/10">
            <div className="flex items-center gap-2">
              <div className="group relative">
                <h2 className="text-nowrap px-3 py-2 font-bold text-stone-600 group-hover:text-violet-950">
                  {meta.get("name")}
                </h2>
                <button
                  className="absolute bottom-0 left-0 right-0 top-0 overflow-hidden rounded-lg bg-transparent transition-colors duration-300 hover:bg-purple-400/30"
                  type="button"
                  onClick={() => {
                    const name = prompt("New name", meta.get("name"));
                    if (!isString(name) || name.length === 0) return;
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
                    className="flex items-center rounded-lg px-3 py-2 font-normal text-stone-300 transition-colors duration-300 hover:bg-purple-300/30 hover:text-purple-600"
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
                    className="flex items-center rounded-lg px-3 py-2 font-normal text-stone-300 transition-colors duration-300 hover:bg-purple-300/30 hover:text-purple-600"
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
                    className="flex items-center gap-2 rounded-lg px-3 py-2 font-normal text-stone-300 transition-colors duration-300 hover:bg-purple-300/30 hover:text-purple-600"
                    href="#"
                  >
                    <span className="">Collaborate</span>
                    <BoltIcon className="-mx-1 size-6" aria-hidden />
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
