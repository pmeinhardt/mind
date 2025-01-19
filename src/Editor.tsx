import type { VersionVector } from "loro-crdt";
import { Peer } from "peerjs";
import { StrictMode, useCallback, useEffect, useMemo, useState } from "react";

import { Bar } from "./editor/Bar";
import { Canvas } from "./editor/Canvas";
import type { Doc } from "./model/types";

export type EditorProps = { doc: Doc };

export function Editor({ doc }: EditorProps) {
  const channel = useMemo(() => new BroadcastChannel("sync"), []);

  useEffect(() => () => channel.close(), [channel]);

  const [version, setVersion] = useState<string>("");

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

  // TODO: Add error boundary

  return (
    <StrictMode>
      <div className="h-dvh w-dvw">
        <div className="h-full w-full">
          <Canvas doc={doc} version={version} />
        </div>
        <div className="absolute left-0 right-0 top-0 flex items-center justify-center p-4">
          <Bar doc={doc} version={version} onCollaborate={onCollaborate} />
        </div>
      </div>
    </StrictMode>
  );
}
