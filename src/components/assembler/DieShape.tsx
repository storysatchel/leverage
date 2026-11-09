import React from "react";
import { cn } from "@/lib/utils";
import { StepDieIcon, isDieSides } from "../ui/StepDieIcon";

interface DieShapeProps {
  type: number;
  /** Tailwind size classes for the SVG. */
  size?: string;
  /** Optional CSS colour override; otherwise the die inherits the text colour. */
  fill?: string;
  showLabel?: boolean;
  /** Tailwind text colour class; the icon uses currentColor. */
  className?: string;
}

/** Renders the step-die polyhedron for a die size; renders nothing for unsupported sizes. */
export const DieShape: React.FC<DieShapeProps> = ({
  type,
  size = "w-14 h-14",
  showLabel = true,
  className,
  fill,
}) => (
  <div
    className={cn(
      "assembler-die-container animate-pop flex items-center justify-center m-1",
      className,
    )}
    style={fill ? { color: fill } : undefined}
  >
    {isDieSides(type) ? <StepDieIcon sides={type} className={size} showLabel={showLabel} /> : null}
  </div>
);
