import React, { useState } from "react";
import { Film } from "lucide-react";
import { ComicButton } from "../ui/ComicButton";

interface FlashbackPanelProps {
  active: boolean;
  onToggle: () => void;
  plotPoints: number;
  /** Called when the player pays 1 Plot Point to create the Asset. */
  onCreateAsset: (name: string) => void;
}

/**
 * Establishment Flashback (core book p.76): describe a brief monochrome scene,
 * hand a Plot Point to the Fixer (or whoever triggered it) and gain a d6 Asset.
 * If nobody triggered it, you must also roll against the Fixer's stakes
 * (usually d6+d6) and only get the Asset if you raise them.
 */
export function FlashbackPanel({ active, onToggle, plotPoints, onCreateAsset }: FlashbackPanelProps) {
  const [name, setName] = useState("");
  return (
    <div className="no-print">
      <button
        type="button"
        aria-pressed={active}
        className="inline-flex items-center gap-2 rounded-sm border border-border-hover bg-gunmetal-700 px-3 py-2 font-display text-sm font-semibold uppercase tracking-wider hover:bg-gunmetal-600 aria-pressed:border-white aria-pressed:bg-white aria-pressed:text-obsidian-950"
        onClick={onToggle}
      >
        <Film size={16} aria-hidden="true" />
        {active ? "Exit Flashback" : "Establishment Flashback"}
      </button>
      {active && (
        <form
          aria-label="Flashback asset"
          className="mt-3 flex flex-col gap-2 rounded-sm border border-flashback-slate bg-obsidian-950/80 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (plotPoints < 1) return;
            onCreateAsset(name.trim() || "Flashback Asset");
            setName("");
            onToggle();
          }}
        >
          <p className="text-sm text-ink-muted">
            Describe the flashback, then pay 1 Plot Point to create a d6 Asset. If nobody triggered the
            flashback for you, roll against the Fixer's stakes first (usually d6 + d6) and only add the Asset if you
            raise them.
          </p>
          <label className="field-label" htmlFor="flashback-asset-name">
            Asset established
          </label>
          <input
            id="flashback-asset-name"
            className="field"
            value={name}
            placeholder="e.g. Rigged the vault door"
            onChange={(e) => setName(e.target.value)}
          />
          <ComicButton type="submit" variant="gold" size="xs" disabled={plotPoints < 1} className="self-start">
            Pay 1 Plot Point, add d6 Asset
          </ComicButton>
          {plotPoints < 1 && <p className="text-sm text-hitch-text">You need a Plot Point to do this.</p>}
        </form>
      )}
    </div>
  );
}
