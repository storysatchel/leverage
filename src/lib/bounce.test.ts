import { describe, it, expect, vi, afterEach } from "vitest";
import { bounceElement, bounceDieWithin, BOUNCE_DURATION_MS } from "./bounce";

const el = () => {
  const node = document.createElement("button");
  node.animate = vi.fn() as unknown as Element["animate"];
  return node;
};

const mockMotion = (reduce: boolean) => {
  window.matchMedia = ((q: string) => ({ matches: reduce && q.includes("reduce"), media: q })) as typeof window.matchMedia;
};

afterEach(() => {
  vi.restoreAllMocks();
  // @ts-expect-error restore jsdom default (no matchMedia)
  delete window.matchMedia;
});

describe("bounceElement", () => {
  it("animates the element", () => {
    mockMotion(false);
    const node = el();
    bounceElement(node);
    expect(node.animate).toHaveBeenCalledWith(expect.any(Array), expect.objectContaining({ duration: BOUNCE_DURATION_MS }));
  });
  it("does nothing under prefers-reduced-motion", () => {
    mockMotion(true);
    const node = el();
    bounceElement(node);
    expect(node.animate).not.toHaveBeenCalled();
  });
  it("tolerates a missing element or no Web Animations support", () => {
    expect(() => bounceElement(null)).not.toThrow();
    expect(() => bounceElement(document.createElement("div"))).not.toThrow();
  });
});

describe("bounceDieWithin", () => {
  it("bounces the die button inside a container", () => {
    mockMotion(false);
    const row = document.createElement("div");
    const die = el();
    die.setAttribute("data-die-button", "");
    row.append(die);
    bounceDieWithin(row);
    expect(die.animate).toHaveBeenCalled();
  });
});
