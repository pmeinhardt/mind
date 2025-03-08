import type { PeerOptions } from "peerjs";
import { Peer } from "peerjs";
import { useCallback, useEffect, useState } from "react";
import { use } from "react";

import { Bar } from "./editor/Bar";
import { Canvas } from "./editor/Canvas";
import { useConfirmNavigation } from "./editor/useConfirmNavigation";
import type { Doc } from "./model";

export type EditorProps = {
  load: (files: File[]) => void;
  promise: Promise<Doc>;
};

export function Editor({ load, promise }: EditorProps) {
  const doc = use(promise);

  useConfirmNavigation(true);

  // Send updates to peers

  const [, setVersion] = useState<string>("");

  useEffect(() => {
    return doc.subscribe(() => {
      const vector = doc.version().toJSON();

      const v = Array.from(vector.entries())
        .map(([key, value]: [string, number]) => `${key}:${value}`)
        .join(" ");

      setVersion(v);
    });
  }, [doc]);

  // Manage from peer connections

  const [connection, setConnection] = useState<Peer>();
  const [connected, setConnected] = useState<boolean>(false);

  const onConnect = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        if (connected || connection) return;

        const options: PeerOptions = {
          host: "localhost",
          port: 9000,
          path: "/",
        };

        const peer = new Peer(options);

        peer.on("open", (id) => {
          alert(`Connection ID: ${id}`); // TODO
          console.log("peer connected", id);
          setConnected(true);
        });

        peer.on("connection", (connection) => {
          console.debug("connection", connection);

          // TODO: Introduce new peer (connection.peer) to others

          connection.on("iceStateChanged", (state) => {
            console.debug("conn ice-state-change", state);
          });

          connection.on("open", () => {
            console.debug("conn open");
            connection.send(doc.export({ mode: "snapshot" }));
          });

          connection.on("data", (data) => {
            console.debug("conn data", data);

            // TODO: Import (or decode freshly joined peer ID and connect)

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

        peer.on("disconnected", (id) => {
          console.debug("peer disconnected", id);
          setConnection(undefined);
          setConnected(false);
        });

        peer.on("close", () => {
          console.debug("peer close");
          setConnection(undefined);
          setConnected(false);
        });

        peer.on("error", (error) => {
          console.error("peer error", error);
          setConnection(undefined);
          setConnected(false);
        });

        setConnection(peer);
      } else {
        connection?.destroy();
        setConnection(undefined);
        setConnected(false);
      }
    },
    [doc, connection, setConnection, connected, setConnected],
  );

  useEffect(() => {
    let previous = doc.version();

    return doc.subscribe((batch) => {
      if (connection && batch.by === "local") {
        const version = doc.version();

        for (const conn of Object.values(connection.connections)) {
          conn.send(doc.export({ mode: "update", from: previous }));
        }

        previous = version;
      }
    });
  }, [doc, connection]);

  return (
    <div className="relative h-dvh w-dvw">
      <div className="absolute left-0 right-0 top-0 flex items-center justify-center p-4">
        <Bar
          doc={doc}
          load={load}
          connection={connection}
          connected={connected}
          onConnect={onConnect}
        />
      </div>
      <div className="h-full w-full">
        <Canvas doc={doc} />
      </div>
    </div>
  );
}
