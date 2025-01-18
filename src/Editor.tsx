import { BoltIcon } from "@heroicons/react/24/outline";
import { isString } from "@sindresorhus/is";
import type { VersionVector } from "loro-crdt";
import { Peer } from "peerjs";
import { StrictMode, useCallback, useEffect, useMemo, useState } from "react";

import { Canvas } from "./Canvas";
import { download } from "./download";
import type { Doc } from "./model/types";

export type EditorProps = { doc: Doc };

export function Editor({ doc }: EditorProps) {
  const channel = useMemo(() => new BroadcastChannel("sync"), []);

  useEffect(() => () => channel.close(), [channel]);

  const [version, setVersion] = useState<string>();

  // Prevent accidentally navigating away and losing changes

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handler);

    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // Send updates to peers

  useEffect(() => {
    let last: VersionVector | undefined = undefined;

    const unsubscribe = doc.subscribe((batch) => {
      console.log("doc event", event);

      const vector = doc.version().toJSON();

      const v = Array.from(vector.entries())
        .map(([key, value]: [string, number]) => `${key}:${value}`)
        .join(" ");

      setVersion(v);

      if (batch.by === "local") {
        const bytes = doc.export({ mode: "update", from: last });
        last = doc.version();
        channel.postMessage(bytes);
      }
    });

    return unsubscribe;
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

  const [, setMe] = useState<Peer>();

  const onCollaborate = useCallback(() => {
    const peer = new Peer({
      host: "localhost",
      port: 9000,
      path: "/",
    });

    const remote = window.location.hash.replace(/^#/, "");
    const mode = remote ? "collaborator" : "owner";

    console.log(mode, remote);

    if (mode === "owner") {
      peer.on("open", (id) => {
        const url = new URL(window.location.toString());
        url.hash = id;

        console.log(url.toString());
      });

      peer.on("connection", (connection) => {
        console.debug("connection", connection);

        connection.on("iceStateChanged", (state) => {
          console.debug("conn ice-state-change", state);
        });

        connection.on("open", () => {
          console.debug("conn open");
          connection.send(doc.exportSnapshot());
        });

        connection.on("data", (data) => {
          console.debug("conn data", data);
        });

        connection.on("error", (error) => {
          console.error("conn error", error);
        });

        connection.on("close", () => {
          console.debug("conn close");
        });
      });
    } else {
      peer.on("open", () => {
        console.debug(`connecting to ${remote}…`);

        const connection = peer.connect(remote, { reliable: true });

        connection.on("iceStateChanged", (state) => {
          console.debug("conn ice-state-change", state);
        });

        connection.on("open", () => {
          console.debug("conn open", peer.id);
          connection.send("HELO");
        });

        connection.on("data", (data) => {
          console.debug("conn data", data);
          const buffer = data as ArrayBuffer;
          doc.import(new Uint8Array(buffer));
        });

        connection.on("error", (error) => {
          console.error("conn error", error);
        });

        connection.on("close", () => {
          console.debug("conn close");
        });
      });
    }

    peer.on("disconnected", (id) => {
      console.debug("peer disconnected", id);
    });

    peer.on("close", () => {
      console.debug("peer close");
    });

    peer.on("error", (error) => {
      console.error("peer error", error);
    });

    setMe(peer);
  }, [doc, setMe]);

  const name = meta.get("name");

  // TODO: Add error boundary

  return (
    <StrictMode>
      <div className="h-dvh w-dvw">
        <div className="h-full w-full">
          <Canvas doc={doc} version={version ?? ""} />
        </div>
        <div className="absolute left-0 right-0 top-0 p-4">
          <div className="flex grow-0 items-center justify-between rounded-xl border-4 border-violet-200/60 bg-white p-2 shadow-sm shadow-violet-800/10">
            <div className="flex items-center gap-2">
              <div className="group relative">
                <h2 className="text-nowrap px-3 py-2 font-bold text-stone-600 group-hover:text-violet-950">
                  {name}
                </h2>
                <button
                  className="absolute bottom-0 left-0 right-0 top-0 overflow-hidden rounded-lg bg-transparent transition-colors duration-300 hover:bg-purple-400/30"
                  type="button"
                  onClick={() => {
                    const n = prompt("New name", name);
                    if (!isString(n) || n.length === 0) return;
                    meta.set("name", n);
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
                      const frontiers = doc.oplogFrontiers();
                      const bytes = doc.export({
                        mode: "shallow-snapshot",
                        frontiers,
                      });
                      const mime = "application/octet-stream";
                      const filename = `${name.replace(/^\./, "").replace(/[\\/]/g, " - ")}.mind`;
                      download([bytes], mime, filename);
                    }}
                  >
                    Download
                  </button>
                </li>
                <li>
                  <a
                    className="flex items-center rounded-lg px-3 py-2 font-normal text-stone-300 transition-colors duration-300 hover:bg-purple-300/30 hover:text-purple-600"
                    href="#TODO"
                  >
                    Help
                  </a>
                </li>
                <li>
                  {version && (
                    <span
                      className="ml-2 flex items-center text-nowrap rounded-md bg-emerald-200/40 px-2 py-1 text-xs text-emerald-400"
                      title={version}
                    >
                      {version.substring(0, 4)}…
                    </span>
                  )}
                </li>
              </ul>
            </div>
            <div className="flex items-center">
              <ul className="flex gap-1">
                <li>
                  <button
                    className="flex items-center gap-2 rounded-lg px-3 py-2 font-normal text-stone-300 transition-colors duration-300 hover:bg-purple-300/30 hover:text-purple-600"
                    type="button"
                    onClick={onCollaborate}
                  >
                    Collaborate
                    <BoltIcon className="-mx-0.5 size-6" aria-hidden />
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </StrictMode>
  );
}
