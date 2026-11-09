import React from "react";
import { cn } from "@/lib/utils";

export type DieSides = 4 | 6 | 8 | 10 | 12;

export const isDieSides = (n: number): n is DieSides =>
  n === 4 || n === 6 || n === 8 || n === 10 || n === 12;

interface StepDieIconProps {
  sides: DieSides;
  className?: string;
  showLabel?: boolean;
}

const common = {
  stroke: "currentColor",
  strokeWidth: 2.2,
  fill: "currentColor",
} as const;
const facet = { stroke: "currentColor", strokeWidth: 1, strokeOpacity: 0.45, fill: "none" } as const;

/** Polyhedral outline per die size (ported from the Tactical Terminal prototype's getDieSVG). */
function Shape({ sides }: { sides: DieSides }) {
  switch (sides) {
    case 4:
      return (
        <>
          <polygon points="18,4 33,30 3,30" {...common} fillOpacity={0.14} />
          <path d="M18 4V21M3 30L18 21M33 30L18 21" {...facet} strokeWidth={1.2} />
        </>
      );
    case 6:
      return (
        <>
          <rect x="5" y="5" width="26" height="26" rx="3" {...common} fillOpacity={0.14} />
          <rect x="9" y="9" width="18" height="18" {...facet} strokeOpacity={0.4} />
        </>
      );
    case 8:
      return (
        <>
          <polygon points="18,2 34,18 18,34 2,18" {...common} fillOpacity={0.16} />
          <line x1="2" y1="18" x2="34" y2="18" {...facet} strokeOpacity={0.4} />
        </>
      );
    case 10:
      return (
        <>
          <polygon points="18,2 33,15 18,34 3,15" {...common} fillOpacity={0.16} />
          <polyline points="3,15 18,20 33,15" {...facet} strokeWidth={1.1} />
        </>
      );
    case 12:
      return (
        <>
          <polygon points="18,2 33,13 27,32 9,32 3,13" {...common} fillOpacity={0.18} />
          <polygon points="18,8 27,15 23,26 13,26 9,15" {...facet} strokeOpacity={0.4} />
        </>
      );
  }
}

// Label baseline per die so the text sits in the visual centre of each outline.
const LABEL_Y: Record<DieSides, number> = { 4: 26, 6: 22, 8: 22, 10: 21, 12: 22 };

/** Step-die SVG. Colour comes from `currentColor`, so theme it with a text-* class. */
export const StepDieIcon: React.FC<StepDieIconProps> = ({
  sides,
  className = "w-14 h-14",
  showLabel = true,
}) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    role="img"
    aria-label={`d${sides}`}
    className={cn("overflow-visible", className)}
  >
    <Shape sides={sides} />
    {showLabel && (
      <text
        x="18"
        y={LABEL_Y[sides]}
        textAnchor="middle"
        fill="currentColor"
        aria-hidden="true"
        className="font-mono"
        fontWeight={700}
        fontSize={sides >= 10 ? 9 : 10}
        stroke="none"
      >{`d${sides}`}</text>
    )}
  </svg>
);
