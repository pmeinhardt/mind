import type { LoroTreeNode } from "loro-crdt";

import type { Doc, Node } from "../model";

export function json(doc: Doc): BlobPart {
  return JSON.stringify(doc.toJSON());
}

export function snapshot(doc: Doc): BlobPart {
  return doc.export({ mode: "snapshot" });
}

export function shallow(doc: Doc): BlobPart {
  return doc.export({ mode: "shallow-snapshot", frontiers: doc.frontiers() });
}

export function markdown(doc: Doc): BlobPart {
  const { main, meta } = doc;

  const lines = [`# ${meta.get("name")}`, ""];

  const indent = (level: number, line: string) => " ".repeat(4 * level) + line;

  const stack: (readonly [number, LoroTreeNode<Node>])[] = main
    .roots()
    .slice()
    .reverse()
    .map((root) => [0, root as LoroTreeNode<Node>]);

  while (stack.length > 0) {
    const [level, node] = stack.pop()!;

    lines.push(indent(level, `- ${node.data.get("label")}`));

    const children = node.children()?.filter((n) => !n.isDeleted()) ?? [];
    children.sort((a, b) => b.index()! - a.index()!);

    stack.push(...children.map((n) => [level + 1, n] as const));
  }

  return lines.join("\n");
}
