import React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlotPointTrayProps {
  value: number;
  onChange: (next: number) => void;
  /** Max chips drawn; the readout always shows the true count. */
  maxChips?: number;
}

/**
 * Plot Point pile (core book p.13: tokens/chips are the suggested tracker).
 * Each chip is a real button that spends one Plot Point; the +/- buttons and the
 * numeric field give keyboard and precise control.
 */
export function PlotPointTray({ value, onChange, maxChips = 12 }: PlotPointTrayProps) {
  const chips = Math.min(value, maxChips);
  return (
    <div
      role="group"
      aria-label="Plot Point tray"
      className="flex flex-wrap items-center gap-3 rounded-sm border border-plot-gold/50 bg-obsidian-950/70 p-3"
    >
      <div className="font-display text-sm font-bold uppercase tracking-wider text-plot-gold">
        Plot Points
      </div>
      <input
        aria-label="Plot Points"
        type="number"
        min={0}
        className="field w-20 font-mono"
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.floor(Number(e.target.value)) || 0))}
      />
      <button
        type="button"
        aria-label="Add a Plot Point"
        className="no-print rounded-sm border border-plot-gold p-1.5 text-plot-gold hover:bg-plot-gold hover:text-obsidian-950"
        onClick={() => onChange(value + 1)}
      >
        <Plus size={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Spend a Plot Point"
        disabled={value === 0}
        className="no-print rounded-sm border border-plot-gold p-1.5 text-plot-gold hover:bg-plot-gold hover:text-obsidian-950 disabled:opacity-40"
        onClick={() => onChange(value - 1)}
      >
        <Minus size={16} aria-hidden="true" />
      </button>
      <ul className="no-print m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Plot Point chips">
        {Array.from({ length: chips }, (_, i) => (
          <li key={i}>
            <button
              type="button"
              className={cn("plot-chip")}
              aria-label={`Spend Plot Point ${i + 1} of ${value}`}
              onClick={() => onChange(value - 1)}
            >
              PP
            </button>
          </li>
        ))}
        {value > chips && <li className="self-center font-mono text-sm text-plot-gold">+{value - chips}</li>}
        {value === 0 && <li className="self-center text-sm text-ink-muted">Pot empty.</li>}
      </ul>
    </div>
  );
}
