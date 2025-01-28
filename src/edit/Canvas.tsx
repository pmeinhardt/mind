import { isString, isUndefined } from "@sindresorhus/is";
import { Group } from "@visx/group";
import { hierarchy, Tree } from "@visx/hierarchy";
import { ParentSize } from "@visx/responsive";
import { Zoom } from "@visx/zoom";
import { clsx } from "clsx";
import type { LoroTree, LoroTreeNode, TreeID } from "loro-crdt";

import type { Doc, Node } from "../model/types";
import { Link as CanvasLink } from "./Link";
import {
  height as nodeHeight,
  Node as CanvasNode,
  width as nodeWidth,
} from "./Node";

// Virtual root node sitting on top of LoroTree roots.
const root = { id: "root", meta: {} } as const;

const f = (node: LoroTreeNode<Node>) => ({
  id: node.id,
  meta: node.data.toJSON(),
});

// Transform LoroTree into D3 hierarchy.
const h = (tree: LoroTree<Node>) =>
  hierarchy(root, (datum) => {
    if (datum === root) return tree.roots().map(f);
    const node = tree.getNodeByID(datum.id as TreeID);
    if (!node.data.get("expanded")) return undefined;
    return node.children()?.map(f);
  });

const scale = { min: 0.5, max: 4.0 } as const;

export type CanvasProps = { doc: Doc };

export function Canvas({ doc }: CanvasProps) {
  const graph = doc.getTree("main");
  const meta = doc.getMap("meta");

  const data = h(graph);

  return (
    <ParentSize className="h-full w-full bg-white">
      {({ width, height }) => {
        if (width === 0 && height === 0) return null;

        return (
          <Zoom<SVGSVGElement>
            width={width}
            height={height}
            scaleXMin={scale.min}
            scaleXMax={scale.max}
            scaleYMin={scale.min}
            scaleYMax={scale.max}
            initialTransformMatrix={{
              scaleX: 1.0,
              scaleY: 1.0,
              skewX: 0.0,
              skewY: 0.0,
              translateX: width / 2,
              translateY: height / 2,
            }}
          >
            {(zoom) => (
              <div className="relative">
                <svg
                  ref={zoom.containerRef}
                  width={width}
                  height={height}
                  className={clsx(
                    "touch-none",
                    zoom.isDragging ? "cursor-grabbing" : "cursor-grab",
                  )}
                >
                  <Group transform={zoom.toString()}>
                    <Tree
                      root={data}
                      size={[width, height]}
                      nodeSize={[nodeHeight * 1.5, nodeWidth * 2]}
                      separation={(a, b) =>
                        (a.parent === b.parent ? 2 : 3) / a.depth
                      }
                    >
                      {(tree) => (
                        <Group>
                          {tree.links().map((link, key) => (
                            <CanvasLink key={key} data={link} />
                          ))}

                          {tree.descendants().map((node, key) => (
                            <CanvasNode
                              key={key}
                              depth={node.depth}
                              x={node.x}
                              y={node.y}
                              onCreateChildNode={
                                (/* event */) => {
                                  const n = graph.getNodeByID(node.data.id);
                                  const nn = isUndefined(n)
                                    ? graph.createNode()
                                    : n.createNode();

                                  const label = prompt("new label");

                                  if (!isString(label) || label.length === 0) {
                                    return;
                                  }

                                  nn.data.set("label", label);
                                  nn.data.set("expanded", true);
                                  doc.commit();
                                }
                              }
                              onSelect={() => {
                                const n = graph.getNodeByID(node.data.id);

                                if (isUndefined(n)) {
                                  const prev = meta.get("name");
                                  const name = prompt("new name", prev);
                                  meta.set("name", name ?? prev);
                                  doc.commit();
                                  return;
                                }

                                const prev = n.data.get("label");
                                const label = prompt("new label", prev);
                                n.data.set("label", label ?? prev);
                                doc.commit();
                              }}
                              onToggle={() => {
                                const n = graph.getNodeByID(node.data.id);
                                n.data.set("expanded", !n.data.get("expanded"));
                                doc.commit();
                              }}
                            >
                              {node.depth === 0
                                ? meta.get("name")
                                : node.data.meta.label}
                            </CanvasNode>
                          ))}
                        </Group>
                      )}
                    </Tree>
                  </Group>
                </svg>
              </div>
            )}
          </Zoom>
        );
      }}
    </ParentSize>
  );
}
