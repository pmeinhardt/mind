import type { Loro } from "loro-crdt";
import { useEffect, useState } from "react";

import { Editor } from "./Editor";
import { Launcher } from "./Launcher";
import type { Structure } from "./model";
import { create } from "./model";
import { Session } from "./session";

export type Props = never;

export function Application(/* {}: Props */) {
  const [doc, setDoc] = useState<Loro<Structure>>();
  const [session, setSession] = useState<Session>();

  const [cmd, arg] = location.hash.replace(/^#/, "").split("/");

  useEffect(() => {
    if (!session && cmd === "join") {
      console.debug(`joining ${arg}`);

      // return <Join id={} connect={setSession} />
      const doc = create("");
      setDoc(doc);
      const sess = new Session(arg);

      // sess.on("ready", (id) => {
      //   const url = new URL(window.location.toString());
      //   url.hash = `join/${id}`;
      //   console.log(url.toString());
      // });

      // sess.on("join", (conn) => {
      //   console.debug("join", conn);
      // });

      sess.on("error", console.error);

      sess.on("data", (bytes) => {
        doc.import(bytes);
      });

      sess.on("close", () => {
        setSession(undefined); // TODO: Update state/UI
      });

      setSession(sess);
    }
  }, [cmd, arg]);

  if (doc) {
    return <Editor doc={doc} session={session} connect={setSession} />;
  }

  return <Launcher onReady={setDoc} />;
}
