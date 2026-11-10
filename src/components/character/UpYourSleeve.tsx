import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { ComicButton } from "../ui/ComicButton";

export const STARTING_SPECIALTIES = 2;

interface SleeveCatalogEntry {
  name: string;
  role: string;
}

interface UpYourSleeveProps {
  /** Current number of Specialties on the sheet. */
  count: number;
  roles: string[];
  catalog: SleeveCatalogEntry[];
  onDeclare: (name: string, role: string) => void;
}

/**
 * Blank Specialty slots (core book pp.30, 54-55): a Crewmember starts with two
 * Specialties; a blank one can be declared later in an Establishment Flashback, which
 * grants the Specialty and a Plot Point.
 */
export function UpYourSleeve({ count, roles, catalog, onDeclare }: UpYourSleeveProps) {
  const blanks = Math.max(0, STARTING_SPECIALTIES - count);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  if (blanks === 0) return null;
  const chosenRole = role || roles[0] || "";
  return (
    <div className="my-3 rounded-sm border border-dashed border-leverage-cyan/60 bg-obsidian-950/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles size={16} className="text-leverage-neon" aria-hidden="true" />
        <span className="font-display text-sm font-bold uppercase tracking-wider text-leverage-neon">
          Up your sleeve: {blanks} blank {blanks === 1 ? "slot" : "slots"}
        </span>
        <ComicButton
          variant="cyan"
          size="xs"
          aria-expanded={open}
          className="ml-auto no-print"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Declare in a flashback"}
        </ComicButton>
      </div>
      {open && (
        <form
          aria-label="Declare a Specialty"
          className="mt-3 grid gap-2 sm:grid-cols-2 no-print"
          onSubmit={(e) => {
            e.preventDefault();
            onDeclare(name.trim() || "Improvised Tradecraft", chosenRole);
            setName("");
            setRole("");
            setOpen(false);
          }}
        >
          <div>
            <label className="field-label" htmlFor="sleeve-example">Book example</label>
            <select
              id="sleeve-example"
              className="field"
              defaultValue=""
              onChange={(e) => {
                const entry = catalog[Number(e.target.value)];
                if (entry) {
                  setName(entry.name);
                  setRole(entry.role);
                }
              }}
            >
              <option value="">Pick one, or type your own…</option>
              {catalog.map((c, i) => (
                <option key={`${c.name}-${i}`} value={i}>
                  {c.name} ({c.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="sleeve-name">Specialty</label>
            <input
              id="sleeve-name"
              className="field"
              value={name}
              placeholder="Improvised Tradecraft"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="sleeve-role">Role</label>
            <select id="sleeve-role" className="field" value={chosenRole} onChange={(e) => setRole(e.target.value)}>
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <ComicButton type="submit" variant="gold" size="xs">
              Add Specialty (+1 Plot Point)
            </ComicButton>
          </div>
        </form>
      )}
    </div>
  );
}
