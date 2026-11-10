import React, { useRef } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { bounceDieWithin } from "@/lib/bounce";
import { stepDown, stepUp, type StepDie, type Trait } from "@/lib/leverage";
import DieIcon from "../ui/DieIcon";
import EditableTextarea from "../ui/EditableTextarea";

interface IndexCardProps {
  kind: "asset" | "complication";
  item: Trait;
  isReadOnly: boolean;
  onChange: (next: Trait) => void;
  onRemove: () => void;
  onUse: () => void;
}

/**
 * Index-card presentation for Assets (gold) and Complications (crimson), with
 * step up / step down. Stepping up caps at d12 (core book p.77); it stays
 * available in play mode because Assets and Complications change during a scene.
 */
export function IndexCard({ kind, item, isReadOnly, onChange, onRemove, onUse }: IndexCardProps) {
  const isAsset = kind === "asset";
  const cardRef = useRef<HTMLLIElement>(null);
  const setDie = (die: StepDie) => onChange({ ...item, die });
  return (
    <li
      ref={cardRef}
      className={cn(
        "chamfer-sm flex w-full flex-col gap-2 p-3 sm:w-64",
        isAsset ? "index-card-asset" : "index-card-complication",
      )}
      data-kind={kind}
    >
      <div className="flex items-center gap-2">
        <DieIcon
          value={item.die}
          label={item.name}
          actionLabel={isAsset ? undefined : "add to the Fixer's opposition pool"}
          size="w-10 h-10"
          isReadOnly
          onTraitClick={onUse}
          className={isAsset ? "text-plot-gold!" : "text-hitch-text!"}
        />
        <EditableTextarea
          className="min-w-0 flex-1 font-display text-base font-semibold uppercase text-foreground"
          value={item.name}
          onChange={(name) => onChange({ ...item, name })}
          placeholder={isAsset ? "Asset" : "Complication"}
          isReadOnly={isReadOnly}
          onTraitClick={() => {
            bounceDieWithin(cardRef.current);
            onUse();
          }}
        />
      </div>
      <div className="no-print flex items-center gap-2">
        <button
          type="button"
          aria-label={`Step up ${item.name} to d${stepUp(item.die)}`}
          disabled={item.die === "12"}
          className="inline-flex items-center gap-1 rounded-sm border border-border-hover px-2 py-1 font-mono text-xs uppercase hover:bg-white/10 disabled:opacity-40"
          onClick={() => setDie(stepUp(item.die))}
        >
          <ChevronUp size={14} aria-hidden="true" /> Step up
        </button>
        <button
          type="button"
          aria-label={`Step down ${item.name} to d${stepDown(item.die)}`}
          disabled={item.die === "4"}
          className="inline-flex items-center gap-1 rounded-sm border border-border-hover px-2 py-1 font-mono text-xs uppercase hover:bg-white/10 disabled:opacity-40"
          onClick={() => setDie(stepDown(item.die))}
        >
          <ChevronDown size={14} aria-hidden="true" /> Step down
        </button>
        <button
          type="button"
          aria-label={`Remove ${item.name}`}
          className="ml-auto rounded-sm p-1 text-hitch-text hover:bg-hitch-crimson/20"
          onClick={onRemove}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
