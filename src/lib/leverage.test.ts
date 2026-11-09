import { describe, it, expect } from "vitest";
import { characterSchema, defaultCharacter, leverageTotal } from "./leverage";

describe("leverageTotal", () => {
  it("sums the two highest dice, ignoring ones", () => {
    expect(leverageTotal([8, 3, 5, 1])).toEqual({ total: 13, kept: [8, 5], ones: 1 });
  });
  it("uses a single die when only one is above 1", () => {
    expect(leverageTotal([1, 4, 1])).toEqual({ total: 4, kept: [4], ones: 2 });
  });
  it("is 0 when every die shows 1, or the pool is empty", () => {
    expect(leverageTotal([1, 1])).toEqual({ total: 0, kept: [], ones: 2 });
    expect(leverageTotal([])).toEqual({ total: 0, kept: [], ones: 0 });
  });
  it("does not mutate its input", () => {
    const rolls = [2, 6, 4];
    leverageTotal(rolls);
    expect(rolls).toEqual([2, 6, 4]);
  });
});

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
