import React from "react";
import { cn } from "@/lib/utils";

/** Known Leverage Roles; each has an accent defined in index.css via [data-role]. */
export const ROLE_KEYS = ["mastermind", "grifter", "hacker", "hitter", "thief"] as const;

export function roleKey(name: string): string {
  const k = name.trim().toLowerCase();
  return (ROLE_KEYS as readonly string[]).includes(k) ? k : "";
}

interface RoleSelectorProps {
  roles: { id: string; name: string }[];
  selected: string;
  onSelect: (roleName: string) => void;
}

/** Choose the Role in focus; the page accent colour follows it (CSS vars --role-accent / --role-glow). */
export function RoleSelector({ roles, selected, onSelect }: RoleSelectorProps) {
  return (
    <div role="group" aria-label="Role in focus" className="no-print flex flex-wrap gap-2">
      {roles.map((r) => {
        const active = r.name === selected;
        return (
          <button
            key={r.id}
            type="button"
            aria-pressed={active}
            data-role={roleKey(r.name)}
            className={cn(
              "inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors",
              active
                ? "border-(--role-accent) bg-(--role-accent)/15 text-foreground role-glow"
                : "border-border text-ink-muted hover:border-border-hover hover:text-foreground",
            )}
            onClick={() => onSelect(r.name)}
          >
            <span aria-hidden="true" className="size-2.5 rounded-full bg-(--role-accent)" />
            {r.name}
          </button>
        );
      })}
    </div>
  );
}
