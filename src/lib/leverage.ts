import { z } from "zod";

export const dieSchema = z.enum(["4", "6", "8", "10", "12"]);
export const traitSchema = z
  .object({ id: z.string(), name: z.string(), die: dieSchema })
  .strict();
export const specialtySchema = traitSchema
  .extend({ role: z.string() })
  .strict();
export const talentSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    notes: z.string(),
    die: dieSchema,
  })
  .strict();
export const characterSchema = z
  .object({
    name: z.string().min(1),
    alias: z.string(),
    portrait: z.string().nullable(),
    background: z.string(),
    pp: z.number().int().min(0),
    roles: z.array(traitSchema),
    attributes: z.array(traitSchema),
    distinctions: z.array(
      z.object({ id: z.string(), name: z.string() }).strict(),
    ),
    specialties: z.array(specialtySchema),
    talents: z.array(talentSchema),
    assets: z.array(traitSchema),
    complications: z.array(traitSchema),
  })
  .strict();
export type CharacterData = z.infer<typeof characterSchema>;
export type Trait = z.infer<typeof traitSchema>;
export type StepDie = z.infer<typeof dieSchema>;
const trait = (name: string, die: StepDie): Trait => ({
  id: name.toLowerCase(),
  name,
  die,
});
export const defaultCharacter: CharacterData = {
  name: "CREWMEMBER",
  alias: "",
  portrait: null,
  background: "",
  pp: 1,
  roles: [
    trait("Grifter", "10"),
    trait("Hacker", "8"),
    trait("Hitter", "6"),
    trait("Mastermind", "4"),
    trait("Thief", "4"),
  ],
  attributes: [
    trait("Agility", "10"),
    trait("Alertness", "10"),
    trait("Intelligence", "8"),
    trait("Strength", "8"),
    trait("Vitality", "6"),
    trait("Willpower", "6"),
  ],
  distinctions: [1, 2, 3].map((i) => ({
    id: `dist-${i}`,
    name: `DISTINCTION ${i}`,
  })),
  specialties: [],
  talents: [],
  assets: [],
  complications: [],
};
export function validateCharacterJson(text: string) {
  try {
    const result = characterSchema.safeParse(JSON.parse(text));
    if (result.success) return { success: true as const, data: result.data };
    return {
      success: false as const,
      errors: result.error.issues.map(
        (e) => `${e.path.join(".")}: ${e.message}`,
      ),
    };
  } catch (e) {
    return {
      success: false as const,
      errors: [
        `Failed to parse JSON string: ${e instanceof Error ? e.message : "Unknown error"}`,
      ],
    };
  }
}

/** Default number of dice added together (core book p.12). */
export const DEFAULT_KEPT_DICE = 2;

/**
 * Leverage total: set aside 1s, add the `include` highest remaining dice
 * (two by default; each Plot Point spent after the roll includes one more, p.13); all 1s => 0.
 */
export function leverageTotal(rolls: number[], include: number = DEFAULT_KEPT_DICE) {
  const ones = rolls.filter((r) => r === 1).length;
  const kept = rolls
    .filter((r) => r > 1)
    .sort((a, b) => b - a)
    .slice(0, include);
  return { total: kept.reduce((a, b) => a + b, 0), kept, ones };
}

/** Core book p.12: raising the stakes by 5 or more is an Extraordinary Success. */
export const EXTRAORDINARY_MARGIN = 5;

export type Outcome = "success" | "extraordinary" | "miss";

/**
 * Compare a total against the stakes. The book requires beating the stakes
 * (p.64: Basic Actions "require you to raise the stakes, not get a tie"), so equal totals are a miss.
 */
export function classifyOutcome(total: number, stakes: number): { outcome: Outcome; margin: number } {
  const margin = total - stakes;
  if (margin >= EXTRAORDINARY_MARGIN) return { outcome: "extraordinary", margin };
  return { outcome: margin > 0 ? "success" : "miss", margin };
}

export const DIE_STEPS: readonly StepDie[] = ["4", "6", "8", "10", "12"];

/** Step a die up one size; no Asset may exceed d12 (pp.76-77). */
export function stepUp(die: StepDie): StepDie {
  return DIE_STEPS[Math.min(DIE_STEPS.indexOf(die) + 1, DIE_STEPS.length - 1)];
}

/** Step a die down one size, floored at d4 (the book has no general step-down rule). */
export function stepDown(die: StepDie): StepDie {
  return DIE_STEPS[Math.max(DIE_STEPS.indexOf(die) - 1, 0)];
}

export type DieStatus = "kept" | "unused" | "one";

/**
 * Per-die breakdown consistent with {@link leverageTotal}: 1s are set aside,
 * the two highest remaining dice are kept, any others are unused.
 * Ties between equal values resolve to the earlier die.
 */
export function classifyDice(rolls: number[], include: number = DEFAULT_KEPT_DICE): DieStatus[] {
  const order = rolls
    .map((value, index) => ({ value, index }))
    .filter((d) => d.value > 1)
    .sort((a, b) => b.value - a.value || a.index - b.index)
    .slice(0, include)
    .map((d) => d.index);
  return rolls.map((value, i) => (value === 1 ? "one" : order.includes(i) ? "kept" : "unused"));
}
