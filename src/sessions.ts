import { EventEmitter } from "eventemitter3";
import type { DataConnection, PeerOptions } from "peerjs";
import { Peer } from "peerjs";

export type SessionOptions = PeerOptions;

export type SessionEvents = {
  ready: (id: string) => void;
  error: (error: Error) => void;
  close: () => void;
  data: (bytes: Uint8Array) => void;
};

export abstract class Session<
  Events extends SessionEvents = SessionEvents,
> extends EventEmitter<Events> {
  abstract send(bytes: Uint8Array): void;
  abstract close(): void;
}

export type HostSessionEvents = SessionEvents & {
  join: (id: string) => void;
  leave: (id: string) => void;
};

export class HostSession extends Session<HostSessionEvents> {
  private readonly peer: Peer;
  private readonly connections: Set<DataConnection> = new Set();

  constructor(options: SessionOptions) {
    super();

    const peer = new Peer(options);

    // Emitted when a connection to the PeerServer is established.
    peer.on("open", (id) => {
      this.emit("ready", id);
    });

    // Emitted when a new data connection is established from a remote peer.
    peer.on("connection", (connection) => {
      this.connections.add(connection);

      // Emitted when the connection is established and ready-to-use.
      connection.on("open", () => {
        this.emit("join", connection.peer);
      });

      // Emitted when data is received from the remote peer.
      connection.on("data", (data) => {
        const buffer = data as ArrayBuffer;
        const bytes = new Uint8Array(buffer);
        this.emit("data", bytes);
      });

      // Emitted when there is an error on the connection.
      connection.on("error", () => {
        // Is there anything we can do???
      });

      // Emitted when either you or the remote peer closes the connection.
      connection.on("close", () => {
        this.connections.delete(connection);
        this.emit("leave", connection.peer);
      });
    });

    // Errors on the peer are almost always fatal and will destroy the peer.
    peer.on("error", (error) => {
      this.emit("error", error);
    });

    // Emitted when the peer is destroyed and can no longer accept or create any new connections.
    peer.on("close", () => {
      this.emit("close");
    });

    // Emitted when the peer is disconnected from the signalling server.
    // Existing connections may continue to work, but new ones cannot be created or accepted.
    peer.on("disconnected", () => {
      this.close();
    });

    this.peer = peer;
  }

  send(bytes: Uint8Array) {
    this.connections.forEach((connection) => connection.send(bytes)); // broadcast
  }

  close() {
    this.connections.clear();
    this.peer.destroy();
  }
}

export type GuestSessionEvents = SessionEvents;

export class GuestSession extends Session<GuestSessionEvents> {
  private readonly peer: Peer;
  private connection: DataConnection | undefined;

  constructor(options: SessionOptions, remote: string) {
    super();

    const peer = new Peer(options);

    // Emitted when a connection to the PeerServer is established.
    peer.on("open", (id) => {
      const connection = peer.connect(remote);

      connection.on("open", () => {
        this.emit("ready", peer.id);
      });

      connection.on("data", (data) => {
        const buffer = data as ArrayBuffer;
        const bytes = new Uint8Array(buffer);
        this.emit("data", bytes);
      });

      connection.on("error", (error) => {
        console.error("connection error", error); // TODO: handle?
        connection.close();
      });

      connection.on("close", () => {
        this.close();
      });

      this.connection = connection;

      this.emit("ready", id);
    });

    // Errors on the peer are almost always fatal and will destroy the peer.
    peer.on("error", (error) => {
      this.emit("error", error);
    });

    // Emitted when the peer is destroyed and can no longer accept or create any new connections.
    peer.on("close", () => {
      this.emit("close");
    });

    // Emitted when the peer is disconnected from the signalling server.
    // Existing connections may continue to work, but new ones cannot be created or accepted.
    peer.on("disconnected", () => {
      this.close();
    });

    this.peer = peer;
  }

  send(bytes: Uint8Array): void {
    this.connection?.send(bytes);
  }

  close(): void {
    this.connection = undefined;
    this.peer.destroy();
  }
}
