import { isString } from "@sindresorhus/is";
import { Group } from "@visx/group";
import { hierarchy, Tree } from "@visx/hierarchy";
import { ParentSize } from "@visx/responsive";
import { Zoom } from "@visx/zoom";
import { clsx } from "clsx";
import type { LoroMap, LoroTree, LoroTreeNode, TreeID } from "loro-crdt";
import { useState } from "react";

import type { Doc, Meta, Node } from "../model";
import { Link as CanvasLink } from "./Link";
import {
  height as nodeHeight,
  Node as CanvasNode,
  width as nodeWidth,
} from "./Node";

// Virtual root node sitting on top of LoroTree roots.
const root = { id: "root", meta: {} } as const;

type RootNode = typeof root;
type ItemNode = { id: TreeID; meta: Node };

type NodeId = ItemNode["id"] | RootNode["id"];

const f = (node: LoroTreeNode<Node>): ItemNode => ({
  id: node.id,
  meta: node.data.toJSON(),
});

// Transform LoroTree into D3 hierarchy.
const h = (tree: LoroTree<Node>, meta: LoroMap<Meta>) =>
  hierarchy<RootNode | ItemNode>(root, (datum) => {
    if (datum === root) {
      if (meta.get("expanded") === false) return undefined;
      return (tree.roots() as LoroTreeNode<Node>[])
        .filter((node: LoroTreeNode) => !node.isDeleted())
        .map(f);
    }

    const node = tree.getNodeByID(datum.id as TreeID);
    if (node.data.get("expanded") === false) return undefined;

    return node
      .children()
      ?.filter((node: LoroTreeNode) => !node.isDeleted())
      ?.map(f);
  });

const scale = { min: 0.5, max: 4.0 } as const;

export type CanvasProps = { doc: Doc };

export function Canvas({ doc }: CanvasProps) {
  const { main, meta } = doc;

  const data = h(main, meta);

  const [focusNodeId, setFocusNodeId] = useState<NodeId>();

  const onNodeToggle = (id: NodeId) => {
    if (id === root.id) {
      meta.set("expanded", meta.get("expanded") === false);
      doc.commit();
    } else {
      const node = main.getNodeByID(id);
      node.data.set("expanded", node.data.get("expanded") === false);
      doc.commit();
    }
  };

  const onAddNode = (id: NodeId) => {
    if (id !== root.id) {
      const node = main.getNodeByID(id);
      const parent = node.parent();
      const index = node.index() ?? 0;
      const next = main.createNode(parent?.id, index + 1);
      doc.commit();
      setFocusNodeId(next.id);
    }
  };

  const onNodeEdit = (id: NodeId) => {
    if (id === root.id) {
      const prev = meta.get("name");
      const name = prompt("new name", prev);
      meta.set("name", name ?? prev);
      doc.commit();
    } else {
      const node = main.getNodeByID(id);
      const prev = node.data.get("label");
      const label = prompt("new label", prev);
      node.data.set("label", label ?? prev);
      doc.commit();
    }
  };

  const onNodeUp = (id: NodeId) => {
    if (id !== root.id) {
      const node = main.getNodeByID(id);

      const parent = node.parent() ?? root;
      if (!parent) return;

      setFocusNodeId(parent.id);
    }
  };

  const onNodeDown = (id: NodeId) => {
    if (id !== root.id) {
      const node = main.getNodeByID(id);

      const children = node.children();
      if (!children) return;

      const child = children[Math.floor((children.length - 1) / 2)];
      if (!child) return;

      if (!node.data.get("expanded")) onNodeToggle(node.id);

      setFocusNodeId(child.id);
    } else {
      const children = main.roots();
      if (!children) return;

      const child = children[Math.floor((children.length - 1) / 2)];
      if (!child) return;

      setFocusNodeId(child.id);
    }
  };

  const onNodePrev = (id: NodeId) => {
    if (id !== root.id) {
      const node = main.getNodeByID(id);

      const index = node.index();
      if (typeof index === "undefined") return;

      if (index === 0) return; // TODO: Jump via parent?

      const siblings = node.parent()?.children() ?? main.roots();
      if (!siblings) return;

      const left = siblings[index - 1];
      setFocusNodeId(left.id);
    }
  };

  const onNodeNext = (id: NodeId) => {
    if (id !== root.id) {
      const node = main.getNodeByID(id);

      const index = node.index();
      if (typeof index === "undefined") return;

      const siblings = node.parent()?.children() ?? main.roots();
      if (!siblings) return;

      if (index >= siblings.length - 1) return; // TODO: Jump via parent?

      const right = siblings[index + 1];
      setFocusNodeId(right.id);
    }
  };

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
                            focused={node.data.id === focusNodeId}
                            x={node.x}
                            y={node.y}
                            onFocus={
                              (/* event */) => {
                                setFocusNodeId(node.data.id);
                              }
                            }
                            onBlur={
                              (/* event */) => {
                                setFocusNodeId(undefined);
                              }
                            }
                            onClick={(event) =>
                              event.detail !== 1
                                ? onNodeToggle(node.data.id)
                                : onNodeEdit(node.data.id)
                            }
                            onKeyDown={(event) => {
                              if (event.key === " ") {
                                onNodeToggle(node.data.id);
                              } else if (event.key === "Enter") {
                                onAddNode(node.data.id);
                              } else if (event.key === "Backspace") {
                                // onNodeDelete(node.data.id);
                              } else if (event.key === "ArrowUp") {
                                onNodePrev(node.data.id);
                              } else if (event.key === "ArrowDown") {
                                onNodeNext(node.data.id);
                              } else if (event.key === "ArrowLeft") {
                                onNodeUp(node.data.id);
                              } else if (event.key === "ArrowRight") {
                                onNodeDown(node.data.id);
                              } else if (event.key === "Tab") {
                                // …
                              } else if (event.key === "e") {
                                onNodeEdit(node.data.id);
                              } else if (event.key === "Escape") {
                                event.target.blur();
                              }
                            }}
                            onCreateChildNode={
                              (/* event */) => {
                                const child =
                                  node.data.id === root.id
                                    ? main.createNode()
                                    : main
                                        .getNodeByID(node.data.id)
                                        .createNode();

                                const label = prompt("new label");

                                if (!isString(label)) return;

                                child.data.set("label", label);
                                child.data.set("expanded", true);
                                doc.commit();
                              }
                            }
                          >
                            {node.data.id === root.id
                              ? meta.get("name")
                              : node.data.meta.label}
                          </CanvasNode>
                        ))}
                      </Group>
                    )}
                  </Tree>
                </Group>
              </svg>
            )}
          </Zoom>
        );
      }}
    </ParentSize>
  );
}
