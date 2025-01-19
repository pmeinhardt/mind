import { isString, isUndefined } from "@sindresorhus/is";
import { Group } from "@visx/group";
import { hierarchy, Tree } from "@visx/hierarchy";
import { ParentSize } from "@visx/responsive";
import { Zoom } from "@visx/zoom";
import { clsx } from "clsx";
import type { LoroTree, LoroTreeNode, TreeID } from "loro-crdt";
import { useMemo } from "react";

import type { Doc, Node } from "../model/types";
import { Link as CanvasLink } from "./Link";
import { Node as CanvasNode } from "./Node";

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

export type CanvasProps = { doc: Doc; version: string };

export function Canvas({ doc, version }: CanvasProps) {
  const graph = useMemo(() => doc.getTree("main"), [doc]);

  // const nodes = useMemo(() => graph.toJSON(), [graph, version]);
  // const data = useMemo(() => strat(nodes), [nodes]);

  const data = useMemo(() => h(graph), [graph, version]);
  const meta = useMemo(() => doc.getMap("meta"), [doc, version]);

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
                      size={[data.height * 300, data.height * 200]}
                      separation={(a, b) =>
                        (a.parent === b.parent ? 0.5 : 1) / a.depth
                      }
                    >
                      {(tree) => (
                        <Group top={0} left={60}>
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
                              onSelect={(event) => {
                                const n = graph.getNodeByID(node.data.id);

                                if (isUndefined(n) && event.detail === 1) {
                                  const prev = meta.get("name");
                                  const name = prompt("new name", prev);
                                  meta.set("name", name ?? prev);
                                  doc.commit();
                                  return;
                                }

                                if (event.detail === 1) {
                                  n.data.set(
                                    "expanded",
                                    !n.data.get("expanded"),
                                  );
                                  doc.commit();
                                } else {
                                  const prev = n.data.get("label");
                                  const label = prompt("new label", prev);
                                  n.data.set("label", label ?? prev);
                                  doc.commit();
                                }
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