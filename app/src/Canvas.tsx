import { Group } from "@visx/group";
import { hierarchy, Tree } from "@visx/hierarchy";
import { ParentSize } from "@visx/responsive";
import { Bar, Circle, LinkHorizontal as LinkComponent } from "@visx/shape";
import { Text } from "@visx/text";
import { Zoom } from "@visx/zoom";
import { clsx } from "clsx";
import type { Loro, LoroTree, LoroTreeNode, TreeID } from "loro-crdt";
import { useMemo } from "react";

import type { Node, Structure } from "./types";

// const strat = stratify().id(({ id }) => id).parentId(({ parent }) => parent);

const g = { id: "root", meta: {} };

const f = (node: LoroTreeNode<Node>) => ({
  id: node.id,
  meta: node.data.toJSON(),
});

const h = (tree: LoroTree<Node>) =>
  hierarchy(g, (d) => {
    if (d === g) return tree.roots().map(f);
    const n = tree.getNodeByID(d.id as TreeID);
    if (!n.data.get("expanded")) return undefined;
    return n.children()?.map(f);
  });

export type Props = { doc: Loro<Structure>; vector: string };

function Canvas({ doc, vector }: Props) {
  const graph = useMemo(() => doc.getTree("main"), [doc]);

  // const nodes = useMemo(() => graph.toJSON(), [graph, vector]);
  // const data = useMemo(() => strat(nodes), [nodes]);

  const data = useMemo(() => h(graph), [graph, vector]);
  const meta = useMemo(() => doc.getMap("meta"), [doc, vector]);

  return (
    <ParentSize className="h-full w-full rounded-xl border border-zinc-200 bg-white">
      {({ width, height }) => {
        if (width <= 1 || height <= 1) return null;

        return (
          <Zoom<SVGSVGElement>
            width={width}
            height={height}
            scaleXMin={0.5}
            scaleXMax={4}
            scaleYMin={0.5}
            scaleYMax={4}
            initialTransformMatrix={{
              scaleX: 1,
              scaleY: 1,
              translateX: 0,
              translateY: 0,
              skewX: 0,
              skewY: 0,
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
                      size={[300, data.height * 300]}
                      separation={(a, b) =>
                        (a.parent === b.parent ? 0.5 : 1) / a.depth
                      }
                    >
                      {(tree) => (
                        <Group top={0} left={60}>
                          {tree.links().map((link, key) => (
                            <LinkComponent
                              key={key}
                              data={link}
                              className="fill-none stroke-violet-400/50 stroke-2"
                            />
                          ))}

                          {tree.descendants().map((node, key) => (
                            <Group
                              key={key}
                              className="group/node"
                              top={node.x}
                              left={node.y}
                            >
                              <Bar
                                className={clsx(
                                  "cursor-pointer",
                                  "stroke-2",
                                  node.depth === 0
                                    ? "stroke-violet-500"
                                    : node.depth === 1
                                      ? "stroke-violet-400"
                                      : "stroke-violet-300",
                                  node.depth === 0
                                    ? "fill-violet-500"
                                    : node.depth === 1
                                      ? "fill-violet-100"
                                      : "fill-white",
                                )}
                                x={-100 / 2}
                                y={-32 / 2}
                                width={100}
                                height={32}
                                rx={32 / 2}
                                onClick={(event) => {
                                  const n = graph.getNodeByID(node.data.id);

                                  console.log(n);
                                  if (typeof n === "undefined") return;

                                  if (event.detail == 1) {
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
                              />
                              <Text
                                textAnchor="middle"
                                verticalAnchor="middle"
                                className={clsx(
                                  "font-sans",
                                  "font-medium",
                                  "text-sm",
                                  "pointer-events-none",
                                  node.depth === 0
                                    ? "fill-white"
                                    : node.depth === 1
                                      ? "fill-violet-500"
                                      : "fill-violet-400",
                                )}
                              >
                                {node.depth === 0
                                  ? meta.get("name")
                                  : node.data.meta.label}
                              </Text>
                              <Circle
                                className="cursor-pointer fill-emerald-300 opacity-0 group-hover/node:opacity-100"
                                cx={100 / 2 + 8 / 2 + 6}
                                cy={0}
                                r={8}
                                onClick={
                                  (/* event */) => {
                                    const n = graph.getNodeByID(node.data.id);
                                    const nn =
                                      typeof n !== "undefined"
                                        ? n.createNode()
                                        : graph.createNode();

                                    const label = prompt("new label");

                                    if (
                                      typeof label !== "string" ||
                                      label.length === 0
                                    )
                                      return;

                                    nn.data.set("label", label);
                                    nn.data.set("expanded", true);
                                    doc.commit();
                                  }
                                }
                              />
                            </Group>
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

export default Canvas;
