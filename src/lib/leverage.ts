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
