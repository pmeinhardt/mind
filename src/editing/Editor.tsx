import type { VersionVector } from "loro-crdt";
import { Peer } from "peerjs";
import { useCallback, useEffect, useState } from "react";

import type { Doc } from "../model";
import { Bar } from "./Bar";
import { Canvas } from "./Canvas";
import { useConfirmNavigation } from "./useConfirmNavigation";

export type EditorProps = { doc: Doc };

export function Editor({ doc }: EditorProps) {
  useConfirmNavigation(true);

  // Send updates to peers

  const [, setVersion] = useState<string>("");

  useEffect(() => {
    let last: VersionVector | undefined = undefined;

    const unsubscribe = doc.subscribe((batch) => {
      const vector = doc.version().toJSON();

      const v = Array.from(vector.entries())
        .map(([key, value]: [string, number]) => `${key}:${value}`)
        .join(" ");

      setVersion(v);

      if (batch.by === "local") {
        const bytes = doc.export({ mode: "update", from: last });
        last = doc.version();
        // channel.postMessage(bytes);
      }
    });

    return unsubscribe;
  }, [doc]);

  // Receive updates from peers

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

  return (
    <div className="relative h-dvh w-dvw">
      <div className="absolute left-0 right-0 top-0 flex items-center justify-center p-4">
        <Bar doc={doc} onCollaborate={onCollaborate} />
      </div>
      <div className="h-full w-full">
        <Canvas doc={doc} />
      </div>
    </div>
  );
}
