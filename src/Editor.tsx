import { BoltIcon, BoltSlashIcon } from "@heroicons/react/24/outline";
import { isString } from "@sindresorhus/is";
import type { VersionVector } from "loro-crdt";
import { Loro } from "loro-crdt";
import { StrictMode, useCallback, useEffect, useMemo, useState } from "react";

import { Canvas } from "./Canvas";
import * as config from "./config";
import { download } from "./download";
import type { Structure } from "./model";
import { GuestSession, HostSession } from "./sessions";

function useConfirmNavigation(enabled: boolean) {
  useEffect(() => {
    if (enabled) {
      const handler = (event: BeforeUnloadEvent) => {
        event.preventDefault();
      };

      window.addEventListener("beforeunload", handler);

      return () => window.removeEventListener("beforeunload", handler);
    }
  }, [enabled]);
}

export type Props = {
  connect: (s: HostSession | GuestSession | undefined) => void;
  session: HostSession | GuestSession | undefined;
  doc: Loro<Structure>;
};

export function Editor({ connect, session, doc }: Props) {
  const meta = useMemo(() => doc.getMap("meta"), [doc]);

  const [vector, setVector] = useState<string>();

  // Prevent accidentally navigating away and losing changes

  useConfirmNavigation(true);

  // Send updates to peers

  useEffect(() => {
    if (session instanceof HostSession) {
      //
    } else if (session instanceof GuestSession) {
      session.on("data", (bytes) => {
        try {
          doc.import(bytes);
        } catch (error) {
          console.error(error);
        }
      });
      //
    } else {
    }
  }, [doc, session]);

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

        if (session) session.send(bytes);
      }
    });

    return () => doc.unsubscribe(subscription);
  }, [doc, session]);

  // Start hosting a session

  const onCollaborate = useCallback(() => {
    const sess = new HostSession(config.session);

    sess.on("ready", (id) => {
      const url = new URL(location.toString());
      url.hash = `join:${id}`;
      console.log(url.toString()); // TODO: Update state, show in UI
    });

    sess.on("join", (conn) => {
      console.debug("join", conn);
      const bytes = doc.exportSnapshot();
      sess.send(bytes);
    });

    sess.on("data", (bytes) => {
      doc.import(bytes);
      sess.send(bytes);
    });

    sess.on("close", () => {
      connect(undefined); // TODO: Update state/UI
    });

    connect(sess);
  }, [doc, connect]);

  // Stop an ongoing session

  const onEndSession = useCallback(() => {
    if (session) session.close();
  }, [session]);

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
                  {session ? (
                    <button
                      className="flex items-center gap-2 rounded-lg px-3 py-2 font-normal text-stone-300 transition-colors duration-300 hover:bg-purple-300/30 hover:text-purple-600"
                      type="button"
                      onClick={onEndSession}
                    >
                      End session
                      <BoltSlashIcon className="-mx-0.5 size-6" aria-hidden />
                    </button>
                  ) : (
                    <button
                      className="flex items-center gap-2 rounded-lg px-3 py-2 font-normal text-stone-300 transition-colors duration-300 hover:bg-purple-300/30 hover:text-purple-600"
                      type="button"
                      onClick={onCollaborate}
                    >
                      Collaborate
                      <BoltIcon className="-mx-0.5 size-6" aria-hidden />
                    </button>
                  )}
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
