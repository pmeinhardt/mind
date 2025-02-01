import { Group } from "@visx/group";
import { Bar, Circle } from "@visx/shape";
import { Text } from "@visx/text";
import { clsx } from "clsx";
import type {
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
} from "react";
import { useEffect, useRef } from "react";

export const width = 140;

export const height = 48;

export type NodeEventHandlers = {
  onBlur: FocusEventHandler<SVGElement>;
  onClick: MouseEventHandler<SVGElement>;
  onCreateChildNode: MouseEventHandler<SVGElement>;
  onFocus: FocusEventHandler<SVGElement>;
  onKeyDown: KeyboardEventHandler<SVGElement>;
};

export type NodeProps = NodeEventHandlers & {
  children: string | number | undefined;
  depth: number;
  focused: boolean;
  x: number;
  y: number;
};

export function Node({
  children,
  depth,
  focused = false,
  x,
  y,
  onBlur,
  onClick,
  onCreateChildNode,
  onFocus,
  onKeyDown,
}: NodeProps) {
  const ref = useRef<SVGRectElement>(null);

  useEffect(() => {
    if (focused) ref.current?.focus();
  }, [focused]);

  return (
    <Group className="group/node" top={x} left={y}>
      <Bar
        ref={ref}
        className={clsx(
          "cursor-pointer",
          "rounded-full",
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
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={height / 2}
        onFocus={onFocus}
        onBlur={onBlur}
        onClick={onClick}
        onKeyDown={onKeyDown}
        tabIndex={0}
        focusable
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
        cx={width / 2 + 8 / 2 + 6}
        cy={0}
        r={8}
        onClick={onCreateChildNode}
      />
    </Group>
  );
}
