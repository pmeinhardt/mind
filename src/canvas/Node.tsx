import { Group } from "@visx/group";
import { Bar, Circle } from "@visx/shape";
import { Text } from "@visx/text";
import { clsx } from "clsx";
import type { MouseEvent } from "react";

export type EventHandlers = {
  onCreateChildNode: (event: MouseEvent<SVGElement>) => void;
  onSelect: (event: MouseEvent<SVGElement>) => void;
};

export type Props = EventHandlers & {
  children: string | number | undefined;
  depth: number;
  x: number;
  y: number;
};

export function Node({
  children,
  depth,
  x,
  y,
  onCreateChildNode,
  onSelect,
}: Props) {
  return (
    <Group className="group/node" top={x} left={y}>
      <Bar
        className={clsx(
          "cursor-pointer",
          "stroke-2",
          depth === 0
            ? "stroke-violet-500"
            : depth === 1
              ? "stroke-violet-400"
              : "stroke-violet-300",
          depth === 0
            ? "fill-violet-500"
            : depth === 1
              ? "fill-violet-100"
              : "fill-white",
        )}
        x={-100 / 2}
        y={-32 / 2}
        width={100}
        height={32}
        rx={32 / 2}
        onClick={onSelect}
      />
      <Text
        textAnchor="middle"
        verticalAnchor="middle"
        className={clsx(
          "font-sans",
          "font-medium",
          "text-sm",
          "pointer-events-none",
          depth === 0
            ? "fill-white"
            : depth === 1
              ? "fill-violet-500"
              : "fill-violet-400",
        )}
      >
        {children}
      </Text>
      <Circle
        className="cursor-pointer fill-emerald-300 opacity-0 group-hover/node:opacity-100"
        cx={100 / 2 + 8 / 2 + 6}
        cy={0}
        r={8}
        onClick={onCreateChildNode}
      />
    </Group>
  );
}
