import { LinkHorizontal as LinkComponent } from "@visx/shape";
import type { SharedLinkProps } from "@visx/shape/lib/types";

export type LinkProps = { data: SharedLinkProps<unknown>["data"] };

export function Link({ data }: LinkProps) {
  return (
    <LinkComponent
      data={data}
      className="fill-none stroke-violet-400/50 stroke-2"
    />
  );
}
