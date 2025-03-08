import { Button, Field, Label, Switch } from "@headlessui/react";
import { isString } from "@sindresorhus/is";
import type { Peer } from "peerjs";
import type { ChangeEvent } from "react";
import { useCallback } from "react";

import { download } from "../browser-utils/download";
import { markdown, shallow } from "../export";
import type { Doc } from "../model";

function sanitize(name: string): string {
  return `${name.replace(/^\./, "").replace(/[\\/]/g, " - ")}`;
}

export type BarEventHandlers = {
  load: (files: File[]) => void;
  onConnect: (enabled: boolean) => void;
};

export type BarProps = BarEventHandlers & {
  doc: Doc;
  connection: Peer | undefined;
  connected: boolean;
};

export function Bar({ doc, load, connection, connected, onConnect }: BarProps) {
  const { meta } = doc;

  const name = meta.get("name");

  const onFile = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target?.files ?? []);
      load(files);
    },
    [load],
  );

  return (
    <div className="flex max-w-4xl grow items-center justify-between rounded-xl border border-stone-200 bg-white p-2">
      <div className="flex items-center gap-2">
        <div className="group relative max-w-44">
          <h2 className="truncate px-3 py-2 font-bold text-stone-600 group-hover:text-violet-950">
            {name}
          </h2>
          <Button
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
          </Button>
        </div>
        {/* TODO: Dropdown menu instead of hidden for smaller screens */}
        <ul className="hidden items-center gap-1 sm:flex">
          <li>
            <label
              className="flex cursor-pointer items-center rounded-lg px-3 py-2 font-normal text-stone-300 transition-colors duration-300 hover:bg-purple-300/30 hover:text-purple-600"
              htmlFor="file-input"
            >
              Open
            </label>

            <input
              id="file-input"
              className="sr-only"
              type="file"
              accept=".mind"
              onChange={onFile}
            />
          </li>
          <li>
            <Button
              className="flex items-center rounded-lg px-3 py-2 font-normal text-stone-300 transition-colors duration-300 hover:bg-purple-300/30 hover:text-purple-600"
              type="button"
              onClick={() => {
                const data = shallow(doc);
                const mime = "application/octet-stream";
                const filename = `${sanitize(name)}.mind`;
                download(mime, filename, data);
              }}
            >
              Save
            </Button>
          </li>
          {/* TODO: Export JSON */}
          <li>
            <Button
              className="flex items-center rounded-lg px-3 py-2 font-normal text-stone-300 transition-colors duration-300 hover:bg-purple-300/30 hover:text-purple-600"
              type="button"
              onClick={() => {
                const data = markdown(doc);
                const mime = "text/markdown";
                const filename = `${sanitize(name)}.md`;
                download(mime, filename, data);
              }}
            >
              Export Markdown
            </Button>
          </li>
          <li>
            <Button
              as="a"
              className="flex items-center rounded-lg px-3 py-2 font-normal text-stone-300 transition-colors duration-300 hover:bg-purple-300/30 hover:text-purple-600"
              href="#TODO"
            >
              Help
            </Button>
          </li>
          <li>
            {/* {version && ( */}
            {/*   <span */}
            {/*     className="ml-2 flex items-center text-nowrap rounded-md bg-emerald-200/40 px-2 py-1 text-xs text-emerald-400" */}
            {/*     title={version} */}
            {/*   > */}
            {/*     {version.substring(0, 4)}… */}
            {/*   </span> */}
            {/* )} */}
          </li>
        </ul>
      </div>
      <div className="flex items-center">
        <Field className="flex items-center justify-center gap-2">
          <Label className="font-normal text-stone-300">
            {connected ? "Connected" : "Not connected"}
          </Label>
          <Switch
            checked={connected}
            disabled={connection && !connected}
            onChange={onConnect}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-stone-200 transition data-[checked]:bg-purple-400"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
          </Switch>
        </Field>
      </div>
    </div>
  );
}
