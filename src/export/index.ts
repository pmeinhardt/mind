import type { LoroTreeNode } from "loro-crdt";

import type { Doc, Node } from "../model";

export function json(doc: Doc): BlobPart {
  return JSON.stringify(doc.toJSON());
}

export function snapshot(doc: Doc): BlobPart {
  return doc.export({ mode: "snapshot" });
}

export function shallow(doc: Doc): BlobPart {
  const frontiers = doc.oplogFrontiers();
  return doc.export({ mode: "shallow-snapshot", frontiers });
}

export function markdown(doc: Doc): BlobPart {
  const { main, meta } = doc;

  const output = [];

  output.push(`# ${meta.get("name")}\n`);

  const indent = (level: number, line: string) => " ".repeat(4 * level) + line;

  for (const root of main.roots()) {
    const stack: (readonly [number, LoroTreeNode<Node>])[] = [
      [0, root as LoroTreeNode<Node>],
    ];

    while (stack.length > 0) {
      const [level, node] = stack.pop()!;

      output.push(indent(level, `- ${node.data.get("label")}`));

      const children = node.children()?.filter((n) => !n.isDeleted()) ?? [];
      children.sort((a, b) => b.index()! - a.index()!);

      stack.push(...children.map((n) => [level + 1, n] as const));
    }
  }

  return output.join("\n");
}
