import { describe, it, expect } from "vitest";
import { characterSchema, defaultCharacter } from "./leverage";

describe("Leverage character data", () => {
  it("accepts a complete rap sheet and rejects invalid trait dice", () => {
    expect(characterSchema.safeParse(defaultCharacter).success).toBe(true);
    expect(
      characterSchema.safeParse({
        ...defaultCharacter,
        roles: [{ id: "x", name: "Hacker", die: "7" }],
      }).success,
    ).toBe(false);
  });
});
