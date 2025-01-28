import { Button } from "@headlessui/react";
import { BoltIcon } from "@heroicons/react/24/outline";
import { isString } from "@sindresorhus/is";

import { download } from "../download";
import type { Doc } from "../model/types";

function sanitize(name: string): string {
  return `${name.replace(/^\./, "").replace(/[\\/]/g, " - ")}`;
}

export type BarEventHandlers = { onCollaborate: () => void };

export type BarProps = BarEventHandlers & { doc: Doc };

export function Bar({ doc, onCollaborate }: BarProps) {
  const meta = doc.getMap("meta");
  const name = meta.get("name");

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
            <Button
              className="flex items-center rounded-lg px-3 py-2 font-normal text-stone-300 transition-colors duration-300 hover:bg-purple-300/30 hover:text-purple-600"
              type="button"
              onClick={() => {
                const frontiers = doc.oplogFrontiers();
                const bytes = doc.export({
                  mode: "shallow-snapshot",
                  frontiers,
                });
                const mime = "application/octet-stream";
                const filename = `${sanitize(name)}.mind`;
                download([bytes], mime, filename);
              }}
            >
              Save
            </Button>
          </li>
          {/* TODO: Export JSON and Markdown */}
          {/* <li> */}
          {/*   <Button */}
          {/*     className="flex items-center rounded-lg px-3 py-2 font-normal text-stone-300 transition-colors duration-300 hover:bg-purple-300/30 hover:text-purple-600" */}
          {/*     type="button" */}
          {/*     onClick={() => { */}
          {/*       const bytes = JSON.stringify(doc.toJSON()); */}
          {/*       const mime = "application/json"; */}
          {/*       const filename = `${sanitize(name)}.json`; */}
          {/*       download([bytes], mime, filename); */}
          {/*     }} */}
          {/*   > */}
          {/*     Export JSON */}
          {/*   </Button> */}
          {/* </li> */}
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
        <ul className="flex gap-1">
          <li>
            <Button
              className="flex items-center gap-2 rounded-lg px-3 py-2 font-normal text-stone-300 transition-colors duration-300 hover:bg-purple-300/30 hover:text-purple-600"
              type="button"
              onClick={onCollaborate}
            >
              Collaborate
              <BoltIcon className="-mx-0.5 size-6" aria-hidden />
            </Button>
          </li>
        </ul>
      </div>
    </div>
  );
}
