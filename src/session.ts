import { EventEmitter } from "eventemitter3";
import type { DataConnection, PeerOptions } from "peerjs";
import { Peer } from "peerjs";

export type SessionOptions = PeerOptions;

export type SessionType = "host" | "peer";

export type SessionEvents = {
  ready: (id: string) => void;
  error: (error: Error) => void;
  close: () => void;
  join: (connection: DataConnection) => void;
  data: (bytes: Uint8Array) => void;
};

export const defaults: SessionOptions = {
  host: "localhost",
  port: 9000,
  path: "/",
};

export class Session extends EventEmitter<SessionEvents> {
  readonly type: SessionType;

  private readonly peer: Peer;
  private readonly connections: Set<DataConnection> = new Set();

  constructor(remote: string | undefined = undefined, options: SessionOptions = defaults) {
    super();

    const type = remote ? "peer" : "host";

    this.type = type;

    const peer = new Peer(options);

    peer.on("open", (id) => {
      if (remote) {
        const connection = peer.connect(remote);

        this.connections.add(connection);

        connection.on("open", () => {
          // this.emit("join", connection);
        });

        connection.on("data", (data) => {
          const buffer = data as ArrayBuffer;
          const bytes = new Uint8Array(buffer);
          this.emit("data", bytes);
        });

        connection.on("error", (error) => {
          console.error("connection error", error); // TODO: handle
          connection.close();
        });

        connection.on("close", () => {
          this.connections.delete(connection);
          this.close();
        });
      }

      this.emit("ready", id);
    });

    peer.on("error", (error) => {
      console.error("peer error", error); // TODO: Inform user
      this.close();
    });

    peer.on("close", () => {
      this.close(); // TODO: Notify user
    });

    peer.on("disconnected", () => {
      this.close(); // TODO: Notify user
    });

    if (type == "host") {
      peer.on("connection", (connection) => {
        this.connections.add(connection);

        connection.on("open", () => {
          this.emit("join", connection);
        });

        connection.on("data", (data) => {
          const buffer = data as ArrayBuffer;
          const bytes = new Uint8Array(buffer);
          this.emit("data", bytes);
        });

        connection.on("error", (error) => {
          console.error("connection error", error); // TODO: handle
          connection.close();
        });

        connection.on("close", () => {
          this.connections.delete(connection);
        });
      });
    }

    this.peer = peer;
  }

  broadcast(bytes: Uint8Array) {
    this.connections.forEach((connection) => {
      connection.send(bytes);
    });
  }

  close() {
    this.connections.forEach((connection) => connection.close());
    this.connections.clear();
    this.peer.destroy();
    this.emit("close");
  }
}
