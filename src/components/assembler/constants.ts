export interface Category {
  id: string;
  title: string;
  sub: string;
  bg: string;
  textColor: string;
}
export const BASE_CATEGORIES: Category[] = [
  {
    id: "role",
    title: "ROLE",
    sub: "",
    bg: "#fbf579",
    textColor: "text-black",
  },
  {
    id: "attribute",
    title: "ATTRIBUTE",
    sub: "",
    bg: "#86bcf9",
    textColor: "text-black",
  },
  {
    id: "dist",
    title: "DISTINCTION",
    sub: "d8 or d4 + 1 PP",
    bg: "#3fc959",
    textColor: "text-black",
  },
];
export const TRAIT_CATEGORIES: Category[] = [
  {
    id: "spec",
    title: "SPECIALTY",
    sub: "normally d6",
    bg: "#fbf579",
    textColor: "text-black",
  },
  {
    id: "talent",
    title: "TALENT",
    sub: "when applicable",
    bg: "#86bcf9",
    textColor: "text-black",
  },
  {
    id: "asset",
    title: "ASSET",
    sub: "",
    bg: "#e5523d",
    textColor: "text-black",
  },
  {
    id: "other",
    title: "OTHER DICE",
    sub: "",
    bg: "#bef4f5",
    textColor: "text-black",
  },
];
export const DIE_SEQUENCE: number[] = [6, 8, 10, 12, 4];

/**
 * Pool key for the Fixer's opposition dice. The Fixer rolls Complications as part of the
 * opposition's dice (core book), so they never belong to the Crew's pool: this key is
 * deliberately not a Crew category and is excluded from the Crew roll and roll command.
 */
export const OPPOSITION_POOL = "opposition";
