import React from "react";
import { AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  classifyDice,
  classifyOutcome,
  leverageTotal,
  EXTRAORDINARY_MARGIN,
  type DieStatus,
} from "@/lib/leverage";
import { StepDieIcon, isDieSides } from "../ui/StepDieIcon";

export interface RolledDie {
  id: string;
  value: number;
  label?: string;
  result: number;
}

interface RollResultPanelProps {
  results: RolledDie[];
  /** Extra dice included by spending Plot Points after the roll (core p.13). */
  extraIncluded: number;
  stakes: number | null;
  fixerOnes: number;
  plotPoints?: number;
  onIncludeDie?: () => void;
  onAcceptComplication?: () => void;
}

const STATUS_LABEL: Record<DieStatus, string> = {
  kept: "Counted",
  unused: "Not counted",
  one: "1: set aside",
};

const OUTCOME_COPY = {
  extraordinary: {
    title: "Extraordinary Success",
    detail: (m: number) => `Stakes raised by ${m}. Take down the opposition right then and there.`,
    cls: "border-leverage-neon text-leverage-neon",
  },
  success: {
    title: "Stakes raised",
    detail: (m: number) => `Raised the stakes by ${m}. The Fixer must now raise them or lose.`,
    cls: "border-emerald-400 text-emerald-300",
  },
  miss: {
    title: "Stakes not raised",
    detail: (m: number) =>
      m === 0
        ? "A tie is not enough; the Fixer wins a tie."
        : `Short by ${Math.abs(m)}. The Fixer describes how things go wrong.`,
    cls: "border-hitch-crimson text-hitch-text",
  },
} as const;

/**
 * Roll result panel: dice breakdown, the Leverage total, and (when the Fixer has set
 * stakes) the outcome banner. Announced via aria-live.
 */
export function RollResultPanel({
  results,
  extraIncluded,
  stakes,
  fixerOnes,
  plotPoints,
  onIncludeDie,
  onAcceptComplication,
}: RollResultPanelProps) {
  const values = results.map((r) => r.result);
  const include = 2 + extraIncluded;
  const { total, ones } = leverageTotal(values, include);
  const status = classifyDice(values, include);
  const nonOnes = values.filter((v) => v > 1).length;
  const canInclude = nonOnes > include && (plotPoints ?? 0) > 0 && !!onIncludeDie;
  const outcome = stakes === null ? null : classifyOutcome(total, stakes);
  const copy = outcome ? OUTCOME_COPY[outcome.outcome] : null;

  return (
    <div
      aria-live="polite"
      data-testid="roll-result"
      className="w-full rounded-sm border border-border bg-obsidian-950/80 p-4"
    >
      <strong className="font-display uppercase tracking-wider">Roll results</strong>
      <div className="font-display text-3xl font-bold text-leverage-neon" data-testid="leverage-total">
        TOTAL: {total}
        {ones > 0 && (
          <span className="ml-2 font-mono text-sm font-normal text-hitch-text">
            ({ones} × 1 set aside)
          </span>
        )}
      </div>
      {extraIncluded > 0 && (
        <div className="font-mono text-xs text-ink-muted">
          {include} dice added together ({extraIncluded} extra for Plot Points)
        </div>
      )}
      <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
        {results.map((die, index) => {
          const st = status[index];
          return (
            <li
              key={`${die.id}-${index}`}
              data-status={st}
              className={cn(
                "flex w-24 flex-col items-center rounded-sm border p-2 text-center",
                st === "kept" && "border-leverage-neon bg-leverage-neon/10",
                st === "unused" && "border-border text-ink-muted",
                st === "one" && "border-hitch-crimson bg-hitch-crimson/10 text-hitch-text",
              )}
            >
              {isDieSides(die.value) && (
                <StepDieIcon sides={die.value} className="size-8" showLabel={false} />
              )}
              <span className="font-mono text-2xl font-bold">{die.result}</span>
              <span className="text-xs">
                {die.label ? `${die.label}: ` : ""}d{die.value} = {die.result}
              </span>
              <span className="mt-1 font-mono text-[11px] uppercase">{STATUS_LABEL[st]}</span>
            </li>
          );
        })}
      </ul>

      {canInclude && (
        <button
          type="button"
          className="mt-3 rounded-sm border border-plot-gold px-3 py-1.5 font-mono text-xs uppercase text-plot-gold hover:bg-plot-gold hover:text-obsidian-950"
          onClick={onIncludeDie}
        >
          Spend 1 Plot Point: include another die
        </button>
      )}

      {ones > 0 && (
        <div role="note" className="mt-3 flex gap-2 rounded-sm border border-hitch-crimson bg-hitch-crimson/10 p-3 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-hitch-text" aria-hidden="true" />
          <div>
            <p>
              You rolled {ones} × 1. The Fixer may introduce a Complication (a d6, or step up one you
              have) and hand you a Plot Point for it.
            </p>
            {onAcceptComplication && (
              <button
                type="button"
                className="mt-2 rounded-sm border border-hitch-crimson px-3 py-1 font-mono text-xs uppercase text-hitch-text hover:bg-hitch-crimson hover:text-white"
                onClick={onAcceptComplication}
              >
                Fixer accepts: add d6 Complication, +1 Plot Point
              </button>
            )}
          </div>
        </div>
      )}

      {fixerOnes > 0 && (
        <div role="note" className="mt-3 flex gap-2 rounded-sm border border-leverage-neon bg-leverage-neon/10 p-3 text-sm">
          <Sparkles size={18} className="mt-0.5 shrink-0 text-leverage-neon" aria-hidden="true" />
          <p>The Fixer rolled {fixerOnes} × 1: that is an Opportunity for the Crew.</p>
        </div>
      )}

      {outcome && copy && stakes !== null && (
        <div
          role="status"
          data-testid="outcome-banner"
          data-outcome={outcome.outcome}
          className={cn("mt-3 rounded-sm border-2 p-3", copy.cls)}
        >
          <div className="font-display text-xl font-bold uppercase tracking-wide">{copy.title}</div>
          <div className="text-sm text-foreground">
            {total} vs stakes {stakes}. {copy.detail(Math.abs(outcome.margin))}
          </div>
          <div className="font-mono text-xs text-ink-muted">
            Extraordinary at +{EXTRAORDINARY_MARGIN}.
          </div>
        </div>
      )}
    </div>
  );
}
