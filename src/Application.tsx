import type { Loro } from "loro-crdt";
import { useState } from "react";

import { Editor } from "./Editor";
import { Launcher } from "./Launcher";
import type { Structure } from "./model";
import { GuestSession, HostSession } from "./sessions";

export type Props = never;

export function Application(/* {}: Props */) {
  const [doc, setDoc] = useState<Loro<Structure>>();
  const [session, setSession] = useState<HostSession | GuestSession>();

  if (doc) {
    return <Editor doc={doc} session={session} connect={setSession} />;
  }

  return (
    <Launcher
      onReady={({ doc, session }) => {
        setSession(session);
        setDoc(doc);
      }}
    />
  );
}
