/**
 * Tap feedback for dice: a quick squash-and-bounce via the Web Animations API
 * (the platform primitive; no library or CSS class re-triggering needed).
 * Skipped when the user prefers reduced motion or the API is unavailable (jsdom).
 */
export const BOUNCE_KEYFRAMES: Keyframe[] = [
  { transform: "scale(1) translateY(0)", offset: 0 },
  { transform: "scale(0.82, 0.86) translateY(2px)", offset: 0.2 },
  { transform: "scale(1.14, 1.1) translateY(-7px)", offset: 0.5 },
  { transform: "scale(0.96, 0.97) translateY(0)", offset: 0.78 },
  { transform: "scale(1) translateY(0)", offset: 1 },
];

export const BOUNCE_DURATION_MS = 360;

export function bounceElement(el: Element | null | undefined): void {
  if (!el || typeof el.animate !== "function") return;
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  el.animate(BOUNCE_KEYFRAMES, { duration: BOUNCE_DURATION_MS, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" });
}

/** Bounce the die button inside a trait row or card (used when its name is tapped). */
export function bounceDieWithin(container: Element | null | undefined): void {
  bounceElement(container?.querySelector("[data-die-button]"));
}
