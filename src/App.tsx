import React, { useState, useEffect } from "react";
import { useQueryState } from "nuqs";
import { parseAsCompressedJson } from "./lib/state-parser";
import {
  characterSchema,
  defaultCharacter,
  type CharacterData as RapSheet,
  type Trait,
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
    <label className="block font-bold">
      {label}
      <input
        className="block w-full border-2 border-black p-1 bg-white"
        aria-label={label}
        value={value}
        readOnly={!edit}
        onChange={(e) => change(e.target.value)}
      />
    </label>
  );
  const traits = (
    title: string,
    key: "roles" | "attributes" | "assets" | "complications",
    category: string,
  ) => (
    <section className="p-4 border-b-4 border-black bg-comic-yellow">
      <h2 className="font-comic-title text-3xl">{title}</h2>
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
                [key]: data[key].map((v, i) =>
                  i === index ? { ...v, die } : v,
                ),
              })
            }
            onNameChange={(name) =>
              update({
                [key]: data[key].map((v, i) =>
                  i === index ? { ...v, name } : v,
                ),
              })
            }
            onTraitClick={() => addDie(category, item.die, item.name)}
            onRemove={
              key === "assets" || key === "complications"
                ? () =>
                    update({ [key]: data[key].filter((v) => v.id !== item.id) })
                : undefined
            }
          />
        ))}
      </div>
      {edit && (key === "assets" || key === "complications") && (
        <ComicButton
          size="xs"
          onClick={() =>
            update({
              [key]: [
                ...data[key],
                {
                  id: id(),
                  name: `NEW ${title.toUpperCase()}`,
                  die: "6",
                } satisfies Trait,
              ],
            })
          }
        >
          + ADD {title.toUpperCase()}
        </ComicButton>
      )}
    </section>
  );
  return (
    <div className="min-h-screen bg-white pb-10">
      <header className="bg-black text-white p-4 font-comic-title text-4xl">
        LEVERAGE — RAP SHEET
      </header>
      <div className="lg:hidden flex gap-2 p-4 no-print">
        <ComicButton onClick={() => setTab("sheet")}>RAP SHEET</ComicButton>
        <ComicButton onClick={() => setTab("pool")}>DICE POOL</ComicButton>
      </div>
      <main className="flex flex-col lg:flex-row gap-6 max-w-[1500px] mx-auto p-4 items-start">
        <div
          className={`w-full lg:flex-1 lg:block ${tab === "sheet" ? "" : "hidden"}`}
        >
          <div className="datafile-container">
            <section className="p-4 border-b-4 border-black">
              <div className="flex justify-end">
                <ModeSelector mode={mode} onChange={setMode} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {field("Name", data.name, (name) => update({ name }))}
                {field("Alias", data.alias, (alias) => update({ alias }))}
              </div>
              <div className="mt-4">
                <label className="font-bold">
                  Portrait{" "}
                  {edit && (
                    <input
                      aria-label="Upload portrait"
                      type="file"
                      accept="image/*"
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
                    className="max-h-64"
                  />
                )}
                {edit && data.portrait && (
                  <button onClick={() => update({ portrait: null })}>
                    Remove portrait
                  </button>
                )}
              </div>
              <label className="block font-bold mt-4">
                Background
                <textarea
                  className="block w-full border-2 p-1"
                  value={data.background}
                  readOnly={!edit}
                  onChange={(e) => update({ background: e.target.value })}
                />
              </label>
              <label className="block font-bold mt-4">
                Plot Points{" "}
                <input
                  type="number"
                  min="0"
                  className="border-2 w-20"
                  value={data.pp}
                  onChange={(e) =>
                    update({ pp: Math.max(0, Number(e.target.value) || 0) })
                  }
                />
              </label>
            </section>
            {traits("Roles", "roles", "role")}
            {traits("Attributes", "attributes", "attribute")}
            <section className="p-4 border-b-4 border-black bg-comic-green">
              <h2 className="font-comic-title text-3xl">Distinctions</h2>
              {data.distinctions.map((d, i) => (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center gap-2 mt-2"
                >
                  {edit ? (
                    <input
                      aria-label={`Distinction ${i + 1}`}
                      className="border-2 bg-white p-1"
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
                        className="underline font-bold"
                        onClick={() => addDie("dist", 8, d.name)}
                      >
                        {d.name} d8
                      </button>
                      <button
                        className="underline"
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
                    <button
                      onClick={() =>
                        update({
                          distinctions: data.distinctions.filter(
                            (x) => x.id !== d.id,
                          ),
                        })
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {edit && (
                <ComicButton
                  size="xs"
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
            <section className="p-4 border-b-4 border-black">
              <h2 className="font-comic-title text-3xl">Specialties</h2>
              <p>
                Book examples are suggestions, not an exhaustive list.
                Specialties normally add d6 with their associated role; adjust
                as needed.
              </p>
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
                    <span>({s.role})</span>
                  )}
                </div>
              ))}
              {edit && (
                <>
                  <select
                    aria-label="Specialty examples"
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
                </>
              )}
            </section>
            <section className="p-4 border-b-4 border-black bg-comic-blue">
              <h2 className="font-comic-title text-3xl">Talents</h2>
              <p>
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
                    className="w-full border-2 bg-white"
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
                <>
                  <select
                    aria-label="Talent examples"
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
                </>
              )}
            </section>
            {traits("Assets", "assets", "asset")}
            {traits("Complications", "complications", "comp")}
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
          />
          <div role="status">{toast}</div>
        </div>
      </main>
    </div>
  );
}
export default App;
