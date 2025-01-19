import { BoltIcon } from "@heroicons/react/24/outline";
import { isString } from "@sindresorhus/is";
import { useMemo } from "react";

import { download } from "../download";
import type { Doc } from "../model/types";

export type BarEventHandlers = { onCollaborate: () => void };

export type BarProps = BarEventHandlers & { doc: Doc; version: string };

export function Bar({ doc, version, onCollaborate }: BarProps) {
  const meta = useMemo(() => doc.getMap("meta"), [doc]);

  const name = meta.get("name");

  return (
    <div className="flex max-w-4xl grow items-center justify-between rounded-xl border border-stone-200 bg-white p-2">
      <div className="flex items-center gap-2">
        <div className="group relative max-w-44">
          <h2 className="truncate px-3 py-2 font-bold text-stone-600 group-hover:text-violet-950">
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
        {/* TODO: Dropdown menu instead of hidden for smaller screens */}
        <ul className="hidden items-center gap-1 sm:flex">
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
  );
}
