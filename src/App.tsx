import React, { useState, useEffect } from "react";
import { useQueryState } from "nuqs";
import { parseAsCompressedJson } from "./lib/state-parser";
import {
  characterSchema,
  defaultCharacter,
  type CharacterData as RapSheet,
  type Trait,
  stepUp,
} from "./lib/leverage";
import { loadMode, saveMode } from "./lib/persistence";
import { Assembler } from "./components/assembler/Assembler";
import {
  BASE_CATEGORIES,
  TRAIT_CATEGORIES,
} from "./components/assembler/constants";
import JsonModal from "./components/JsonModal";
import ModeSelector from "./components/character/ModeSelector";
import TraitItem from "./components/ui/TraitItem";
import { PlotPointTray } from "./components/ui/PlotPointTray";
import { IndexCard } from "./components/character/IndexCard";
import { RoleSelector, roleKey } from "./components/character/RoleSelector";
import { FlashbackPanel } from "./components/character/FlashbackPanel";
import { UpYourSleeve } from "./components/character/UpYourSleeve";
import { ComicButton } from "./components/ui/ComicButton";
import talents from "./data/talents.json";
import specialties from "./data/specialties.json";
export type {
  Power,
  SFX,
  PowerSet,
  Specialty,
  Milestone,
  CharacterDataValidation as CharacterData,
} from "./lib/validation";
export interface PoolDie {
  id: string;
  value: number;
  label?: string;
}
export const defaultState = defaultCharacter;
const id = () => crypto.randomUUID();
const categories = [...BASE_CATEGORIES, ...TRAIT_CATEGORIES];
function App() {
  const [data, setData] = useQueryState<RapSheet>(
    "DATAFILE",
    parseAsCompressedJson<RapSheet>((value) => {
      const result = characterSchema.safeParse(value);
      return result.success ? result.data : null;
    })
      .withDefault(defaultCharacter)
      .withOptions({ throttleMs: 300 }),
  );
  const [mode, setMode] = useState<"edit" | "play">(() => loadMode());
  const [pool, setPool] = useState<Record<string, PoolDie[]>>({});
  const [modal, setModal] = useState(false);
  const [tab, setTab] = useState<"sheet" | "pool">("sheet");
  const [toast, setToast] = useState("");
  const [flashback, setFlashback] = useState(false);
  const [focusRole, setFocusRole] = useState("");
  const activeRole = data.roles.some((r) => r.name === focusRole)
    ? focusRole
    : (data.roles[0]?.name ?? "");
  // Establishment Flashback is a monochrome scene: tint the whole page (print resets it).
  useEffect(() => {
    document.body.classList.toggle("flashback-mode", flashback);
    return () => document.body.classList.remove("flashback-mode");
  }, [flashback]);
  useEffect(() => {
    saveMode(mode);
  }, [mode]);
  const update = (changes: Partial<RapSheet>) =>
    setData((prev) => ({ ...prev, ...changes }));
  const addDie = (category: string, die: string | number, label: string) =>
    setPool((prev) => ({
      ...prev,
      [category]: [
        ...(prev[category] || []),
        { id: id(), value: Number(die), label },
      ],
    }));
  const edit = mode === "edit";
  const field = (
    label: string,
    value: string,
    change: (value: string) => void,
  ) => (
    <label className="field-label">
      {label}
      <input
        className="field mt-1 text-base normal-case tracking-normal"
        aria-label={label}
        value={value}
        readOnly={!edit}
        onChange={(e) => change(e.target.value)}
      />
    </label>
  );
  const traits = (title: string, key: "roles" | "attributes", category: string) => (
    <section className="p-4 border-b border-border">
      <h2 className="section-title">{title}</h2>
      <div className="flex flex-wrap gap-6 py-3">
        {data[key].map((item, index) => (
          <TraitItem
            key={item.id}
            die={item.die}
            name={item.name}
            placeholder={title}
            isReadOnly={!edit}
            onDieChange={(die) =>
              update({
                [key]: data[key].map((v, i) => (i === index ? { ...v, die } : v)),
              })
            }
            onNameChange={(name) =>
              update({
                [key]: data[key].map((v, i) => (i === index ? { ...v, name } : v)),
              })
            }
            onTraitClick={() => addDie(category, item.die, item.name)}
          />
        ))}
      </div>
    </section>
  );
  const cards = (
    title: string,
    key: "assets" | "complications",
    category: string,
    kind: "asset" | "complication",
  ) => (
    <section className="p-4 border-b border-border">
      <h2
        className={`section-title ${kind === "asset" ? "text-plot-gold!" : "text-hitch-text!"}`}
      >
        {title}
      </h2>
      <ul className="m-0 flex list-none flex-wrap gap-4 p-0 py-3">
        {data[key].map((item, index) => (
          <IndexCard
            key={item.id}
            kind={kind}
            item={item}
            isReadOnly={!edit}
            onChange={(next) =>
              update({ [key]: data[key].map((v, i) => (i === index ? next : v)) })
            }
            onRemove={() => update({ [key]: data[key].filter((v) => v.id !== item.id) })}
            onUse={() => addDie(category, item.die, item.name)}
          />
        ))}
      </ul>
      {edit && (
      <ComicButton
        size="xs"
        variant={kind === "asset" ? "gold" : "red"}
        className="no-print"
        onClick={() =>
          update({
            [key]: [
              ...data[key],
              { id: id(), name: `NEW ${kind.toUpperCase()}`, die: "6" } satisfies Trait,
            ],
          })
        }
      >
        + ADD {kind.toUpperCase()}
      </ComicButton>
      )}
    </section>
  );
  const declareSpecialty = (name: string, role: string) =>
    update({
      specialties: [...data.specialties, { id: id(), name, role, die: "6" }],
      // Declaring a Specialty in an Establishment Flashback earns a Plot Point (core p.55).
      pp: data.pp + 1,
    });
  const flashbackAsset = (name: string) =>
    update({
      // Establishment Flashback: pay 1 Plot Point, gain a d6 Asset (core p.76).
      pp: Math.max(0, data.pp - 1),
      assets: [...data.assets, { id: id(), name, die: "6" }],
    });
  return (
    <div
      data-role={roleKey(activeRole)}
      className="min-h-screen pb-10 bg-blueprint-grid"
    >
      {flashback && (
        <div
          aria-hidden="true"
          data-testid="flashback-overlay"
          className="no-print pointer-events-none fixed inset-0 z-30 bg-[radial-gradient(circle_at_center,transparent_50%,rgb(0_0_0/0.65)_100%),repeating-linear-gradient(0deg,rgb(255_255_255/0.03)_0px,rgb(255_255_255/0.03)_1px,transparent_1px,transparent_3px)]"
        />
      )}
      <header className="flex items-center gap-3 border-b-2 border-(--role-accent) bg-obsidian-950/90 p-4">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
          className="size-9 shrink-0 text-(--role-accent) motion-safe:animate-reticle"
        >
          <circle cx="16" cy="16" r="10" />
          <circle cx="16" cy="16" r="3" />
          <path d="M16 2v7M16 23v7M2 16h7M23 16h7" />
        </svg>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wider sm:text-3xl">
          Leverage — Rap Sheet
        </h1>
      </header>
      <div className="lg:hidden flex gap-2 p-4 no-print">
        <ComicButton aria-pressed={tab === "sheet"} onClick={() => setTab("sheet")}>
          RAP SHEET
        </ComicButton>
        <ComicButton aria-pressed={tab === "pool"} onClick={() => setTab("pool")}>
          DICE POOL
        </ComicButton>
      </div>
      <main className="flex flex-col lg:flex-row gap-6 max-w-[1500px] mx-auto p-4 items-start">
        <div
          className={`w-full lg:flex-1 lg:block ${tab === "sheet" ? "" : "hidden"}`}
        >
          <div className="datafile-container border-l-4 border-l-(--role-accent)">
            <section className="p-4 border-b border-border">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <RoleSelector roles={data.roles} selected={activeRole} onSelect={setFocusRole} />
                <ModeSelector mode={mode} onChange={setMode} className="no-print" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {field("Name", data.name, (name) => update({ name }))}
                {field("Alias", data.alias, (alias) => update({ alias }))}
              </div>
              <div className="mt-4">
                <label className="field-label">
                  Portrait{" "}
                  {edit && (
                    <input
                      aria-label="Upload portrait"
                      type="file"
                      accept="image/*"
                      className="block text-sm normal-case tracking-normal text-foreground"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () =>
                            update({ portrait: String(reader.result) });
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  )}
                </label>
                {data.portrait && (
                  <img
                    src={data.portrait}
                    alt="Character Portrait"
                    className="mt-2 max-h-64 border border-(--role-accent) role-glow"
                  />
                )}
                {edit && data.portrait && (
                  <ComicButton size="xs" className="mt-2 no-print" onClick={() => update({ portrait: null })}>
                    Remove portrait
                  </ComicButton>
                )}
              </div>
              <label className="field-label mt-4">
                Background
                <textarea
                  className="field mt-1 text-base normal-case tracking-normal"
                  value={data.background}
                  readOnly={!edit}
                  onChange={(e) => update({ background: e.target.value })}
                />
              </label>
              <div className="mt-4">
                <PlotPointTray value={data.pp} onChange={(pp) => update({ pp })} />
              </div>
              <div className="mt-3">
                <FlashbackPanel
                  active={flashback}
                  onToggle={() => setFlashback((v) => !v)}
                  plotPoints={data.pp}
                  onCreateAsset={flashbackAsset}
                />
              </div>
            </section>
            {traits("Roles", "roles", "role")}
            {traits("Attributes", "attributes", "attribute")}
            <section className="p-4 border-b border-border">
              <h2 className="section-title">Distinctions</h2>
              <p className="text-sm text-ink-muted">
                Use a Distinction as a d8, or as a d4 when it hinders you and earn a Plot Point.
              </p>
              {data.distinctions.map((d, i) => (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center gap-2 mt-2"
                >
                  {edit ? (
                    <input
                      aria-label={`Distinction ${i + 1}`}
                      className="field w-auto"
                      value={d.name}
                      onChange={(e) =>
                        update({
                          distinctions: data.distinctions.map((x, n) =>
                            n === i ? { ...x, name: e.target.value } : x,
                          ),
                        })
                      }
                    />
                  ) : (
                    <>
                      <button
                        type="button"
                        className="print-keep underline font-bold hover:text-leverage-neon"
                        onClick={() => addDie("dist", 8, d.name)}
                      >
                        {d.name} d8
                      </button>
                      <button
                        type="button"
                        className="underline text-ink-muted hover:text-leverage-neon"
                        onClick={() => {
                          addDie("dist", 4, d.name + " (hinder)");
                          update({ pp: data.pp + 1 });
                        }}
                      >
                        Hinder d4 (+1 PP)
                      </button>
                    </>
                  )}
                  {edit && (
                    <ComicButton
                      size="xs"
                      variant="red"
                      className="no-print"
                      onClick={() =>
                        update({
                          distinctions: data.distinctions.filter(
                            (x) => x.id !== d.id,
                          ),
                        })
                      }
                    >
                      Remove
                    </ComicButton>
                  )}
                </div>
              ))}
              {edit && (
                <ComicButton
                  size="xs"
                  className="mt-3"
                  onClick={() =>
                    update({
                      distinctions: [
                        ...data.distinctions,
                        { id: id(), name: "NEW DISTINCTION" },
                      ],
                    })
                  }
                >
                  + ADD DISTINCTION
                </ComicButton>
              )}
            </section>
            <section className="p-4 border-b border-border">
              <h2 className="section-title">Specialties</h2>
              <p className="text-sm text-ink-muted">
                Book examples are suggestions, not an exhaustive list.
                Specialties normally add d6 with their associated role; adjust
                as needed.
              </p>
              <UpYourSleeve
                count={data.specialties.length}
                roles={data.roles.map((r) => r.name)}
                catalog={specialties.map((x) => ({ name: x.name, role: x.role }))}
                onDeclare={declareSpecialty}
              />
              {data.specialties.map((s, i) => (
                <div
                  className="flex flex-wrap gap-2 items-center my-2"
                  key={s.id}
                >
                  <TraitItem
                    die={s.die}
                    name={s.name}
                    placeholder="Specialty"
                    isReadOnly={!edit}
                    onDieChange={(die) =>
                      update({
                        specialties: data.specialties.map((x, n) =>
                          n === i ? { ...x, die } : x,
                        ),
                      })
                    }
                    onNameChange={(name) =>
                      update({
                        specialties: data.specialties.map((x, n) =>
                          n === i ? { ...x, name } : x,
                        ),
                      })
                    }
                    onTraitClick={() =>
                      addDie("spec", s.die, `${s.name} (${s.role})`)
                    }
                    onRemove={() =>
                      update({
                        specialties: data.specialties.filter(
                          (x) => x.id !== s.id,
                        ),
                      })
                    }
                  />
                  {edit ? (
                    <select
                      aria-label="Specialty role"
                      className="field w-auto"
                      value={s.role}
                      onChange={(e) =>
                        update({
                          specialties: data.specialties.map((x, n) =>
                            n === i ? { ...x, role: e.target.value } : x,
                          ),
                        })
                      }
                    >
                      {data.roles.map((r) => (
                        <option key={r.id}>{r.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-ink-muted">({s.role})</span>
                  )}
                </div>
              ))}
              {edit && (
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label="Specialty examples"
                    className="field w-auto max-w-full"
                    defaultValue=""
                    onChange={(e) => {
                      const s = specialties[Number(e.target.value)];
                      if (s)
                        update({
                          specialties: [
                            ...data.specialties,
                            { id: id(), name: s.name, role: s.role, die: "6" },
                          ],
                        });
                      e.target.value = "";
                    }}
                  >
                    <option value="">Add a book example…</option>
                    {specialties.map((s, i) => (
                      <option key={i} value={i}>
                        {s.name} ({s.role}) — core p. {s.page}
                      </option>
                    ))}
                  </select>
                  <ComicButton
                    size="xs"
                    onClick={() =>
                      update({
                        specialties: [
                          ...data.specialties,
                          {
                            id: id(),
                            name: "NEW SPECIALTY",
                            role: data.roles[0]?.name || "",
                            die: "6",
                          },
                        ],
                      })
                    }
                  >
                    + CUSTOM
                  </ComicButton>
                </div>
              )}
            </section>
            <section className="p-4 border-b border-border">
              <h2 className="section-title">Talents</h2>
              <p className="text-sm text-ink-muted">
                Talents have no inherent die rating. Use the adjustable die for
                an applicable Talent effect; consult the cited book for its
                rules.
              </p>
              {data.talents.map((t, i) => (
                <div className="my-3" key={t.id}>
                  <TraitItem
                    die={t.die}
                    name={t.name}
                    placeholder="Talent"
                    isReadOnly={!edit}
                    onDieChange={(die) =>
                      update({
                        talents: data.talents.map((x, n) =>
                          n === i ? { ...x, die } : x,
                        ),
                      })
                    }
                    onNameChange={(name) =>
                      update({
                        talents: data.talents.map((x, n) =>
                          n === i ? { ...x, name } : x,
                        ),
                      })
                    }
                    onTraitClick={() => addDie("talent", t.die, t.name)}
                    onRemove={() =>
                      update({
                        talents: data.talents.filter((x) => x.id !== t.id),
                      })
                    }
                  />
                  <textarea
                    aria-label={`${t.name} notes`}
                    className="field mt-1"
                    placeholder="Rules notes / reference"
                    value={t.notes}
                    readOnly={!edit}
                    onChange={(e) =>
                      update({
                        talents: data.talents.map((x, n) =>
                          n === i ? { ...x, notes: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </div>
              ))}
              {edit && (
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label="Talent examples"
                    className="field w-auto max-w-full"
                    defaultValue=""
                    onChange={(e) => {
                      const t = talents[Number(e.target.value)];
                      if (t)
                        update({
                          talents: [
                            ...data.talents,
                            {
                              id: id(),
                              name: t.name,
                              notes: `${t.book}, p. ${t.page} (${t.role})`,
                              die: "8",
                            },
                          ],
                        });
                      e.target.value = "";
                    }}
                  >
                    <option value="">Add a book example…</option>
                    {talents.map((t, i) => (
                      <option key={i} value={i}>
                        {t.name} — {t.book}, p. {t.page}
                      </option>
                    ))}
                  </select>
                  <ComicButton
                    size="xs"
                    onClick={() =>
                      update({
                        talents: [
                          ...data.talents,
                          { id: id(), name: "NEW TALENT", notes: "", die: "8" },
                        ],
                      })
                    }
                  >
                    + CUSTOM
                  </ComicButton>
                </div>
              )}
            </section>
            {cards("Assets", "assets", "asset", "asset")}
            {cards("Complications", "complications", "comp", "complication")}
            <div className="p-4 flex flex-wrap gap-3 no-print">
              <ComicButton
                variant="red"
                onClick={() => setData(defaultCharacter)}
              >
                RESET DATA
              </ComicButton>
              <ComicButton variant="blue" onClick={() => setModal(true)}>
                IMPORT / EXPORT
              </ComicButton>
              <ComicButton variant="green" onClick={() => window.print()}>
                PRINT PDF
              </ComicButton>
            </div>
            <JsonModal
              isOpen={modal}
              onClose={() => setModal(false)}
              data={data}
              onImport={(value) => setData(value)}
            />
          </div>
        </div>
        <div
          className={`w-full lg:w-[450px] lg:block no-print ${tab === "pool" ? "" : "hidden"}`}
        >
          <Assembler
            pool={pool}
            setPool={setPool}
            categories={categories}
            onToast={setToast}
            plotPoints={data.pp}
            onPlotPointsChange={(pp) => update({ pp })}
            onAcceptComplication={() => {
              setData((prev) => ({
                ...prev,
                pp: prev.pp + 1,
                complications: [
                  ...prev.complications,
                  { id: id(), name: "COMPLICATION", die: "6" },
                ],
              }));
              setToast("Added a d6 Complication and 1 Plot Point to your sheet.");
            }}
            complications={data.complications}
            onStepUpComplication={(compId) => {
              setData((prev) => ({
                ...prev,
                complications: prev.complications.map((c) =>
                  c.id === compId ? { ...c, die: stepUp(c.die) } : c,
                ),
              }));
              setToast("Stepped up a Complication.");
            }}
          />
          <div role="status" className="mt-2 text-sm text-ink-muted">
            {toast}
          </div>
        </div>
      </main>
    </div>
  );
}
export default App;
