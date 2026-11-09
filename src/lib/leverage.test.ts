import { describe, it, expect } from "vitest";
import {
  characterSchema,
  classifyDice,
  classifyOutcome,
  defaultCharacter,
  EXTRAORDINARY_MARGIN,
  leverageTotal,
  stepDown,
  stepUp,
} from "./leverage";

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

describe("classifyOutcome (core book p.12, p.69)", () => {
  it("requires strictly beating the stakes: a tie is a miss", () => {
    expect(classifyOutcome(11, 11)).toEqual({ outcome: "miss", margin: 0 });
    expect(classifyOutcome(12, 11)).toEqual({ outcome: "success", margin: 1 });
    expect(classifyOutcome(7, 11)).toEqual({ outcome: "miss", margin: -4 });
  });
  it("is extraordinary when the stakes are raised by 5 or more", () => {
    expect(EXTRAORDINARY_MARGIN).toBe(5);
    expect(classifyOutcome(16, 12).outcome).toBe("success");
    expect(classifyOutcome(17, 12)).toEqual({ outcome: "extraordinary", margin: 5 });
    expect(classifyOutcome(17, 12).outcome).toBe("extraordinary");
  });
});

describe("step dice", () => {
  it("steps up one size and caps at d12", () => {
    expect(stepUp("6")).toBe("8");
    expect(stepUp("10")).toBe("12");
    expect(stepUp("12")).toBe("12");
  });
  it("steps down one size and floors at d4", () => {
    expect(stepDown("8")).toBe("6");
    expect(stepDown("4")).toBe("4");
  });
});

describe("classifyDice", () => {
  it("marks the two highest non-1 dice as kept and 1s as set aside", () => {
    expect(classifyDice([8, 3, 5, 1])).toEqual(["kept", "unused", "kept", "one"]);
  });
  it("agrees with leverageTotal on the kept sum", () => {
    const rolls = [4, 4, 4, 1, 9];
    const kept = classifyDice(rolls);
    const sum = rolls.reduce((a, r, i) => a + (kept[i] === "kept" ? r : 0), 0);
    expect(sum).toBe(leverageTotal(rolls).total);
  });
  it("handles empty and all-ones pools", () => {
    expect(classifyDice([])).toEqual([]);
    expect(classifyDice([1, 1])).toEqual(["one", "one"]);
  });
});

describe("including extra dice with Plot Points (core book p.13)", () => {
  it("adds one more die per Plot Point spent", () => {
    expect(leverageTotal([8, 3, 5, 1], 3)).toEqual({ total: 16, kept: [8, 5, 3], ones: 1 });
    expect(leverageTotal([8, 3, 5], 5).total).toBe(16);
  });
  it("classifies the extra included dice as kept", () => {
    expect(classifyDice([8, 3, 5, 1], 3)).toEqual(["kept", "kept", "kept", "one"]);
  });
});
