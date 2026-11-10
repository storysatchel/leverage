import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import App, { defaultState as defaultCharacter } from "./App";
import * as persistence from "./lib/persistence";
vi.mock("./lib/persistence", () => ({
  loadMode: vi.fn(() => "edit"),
  saveMode: vi.fn(),
}));

describe("Leverage rap sheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(persistence.loadMode).mockReturnValue("edit");
  });
  it("edits and resets character data", () => {
    render(<App />, { wrapper: NuqsTestingAdapter });
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Eliot" },
    });
    expect(screen.getByLabelText("Name")).toHaveValue("Eliot");
    fireEvent.click(screen.getByText("RESET DATA"));
    expect(screen.getByLabelText("Name")).toHaveValue("CREWMEMBER");
  });
  it("uses a distinction as a d4 and awards a plot point", () => {
    vi.mocked(persistence.loadMode).mockReturnValue("play");
    render(<App />, { wrapper: NuqsTestingAdapter });
    fireEvent.click(screen.getAllByText("Hinder d4 (+1 PP)")[0]);
    expect(screen.getByLabelText("Plot Points")).toHaveValue(2);
    expect(screen.getByText("DISTINCTION 1 (hinder)")).toBeInTheDocument();
  });
  it("adds chosen book and custom specialties and a talent", () => {
    render(<App />, { wrapper: NuqsTestingAdapter });
    fireEvent.change(screen.getByLabelText("Specialty examples"), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText("Talent examples"), {
      target: { value: "0" },
    });
    expect(screen.getByText("Explosives")).toBeInTheDocument();
    expect(screen.getByText("Aerialist")).toBeInTheDocument();
    fireEvent.click(screen.getAllByText("+ CUSTOM")[0]);
    expect(screen.getByText("NEW SPECIALTY")).toBeInTheDocument();
  });
  it("adds the user-selected die sizes for all rated traits to the pool", () => {
    vi.mocked(persistence.loadMode).mockReturnValue("play");
    render(<App />, { wrapper: NuqsTestingAdapter });
    fireEvent.click(screen.getByText("IMPORT / EXPORT"));
    const payload = {
      ...defaultCharacter,
      roles: [{ id: "r", name: "Hacker", die: "12" }],
      attributes: [{ id: "a", name: "Agility", die: "10" }],
      specialties: [{ id: "s", name: "Locks", role: "Hacker", die: "8" }],
      talents: [{ id: "t", name: "Custom Talent", notes: "", die: "4" }],
      assets: [{ id: "x", name: "Gadget", die: "12" }],
      complications: [{ id: "c", name: "Alarm", die: "10" }],
    };
    fireEvent.change(
      screen.getByPlaceholderText("Paste character JSON here..."),
      { target: { value: JSON.stringify(payload) } },
    );
    fireEvent.click(screen.getByText(/Load Data/i));
    // The Role also appears in the Role selector, so click the die button.
    fireEvent.click(screen.getByRole("button", { name: /^Hacker, d12/ }));
    for (const name of [
      "Agility",
      "Locks",
      "Custom Talent",
      "Gadget",
    ])
      fireEvent.click(screen.getByText(name));
    // Complications are the opposition's dice: tapping one never joins the Crew's pool.
    fireEvent.click(screen.getByText("Alarm"));
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    fireEvent.click(screen.getByText("ROLL POOL"));
    for (const result of [
      "Hacker: d12 = 7",
      "Agility: d10 = 6",
      "Locks (Hacker): d8 = 5",
      "Custom Talent: d4 = 3",
      "Gadget: d12 = 7",
    ])
      expect(screen.getByText(result)).toBeInTheDocument();
    expect(screen.queryByText("Alarm: d10 = 6")).not.toBeInTheDocument();
    expect(screen.queryByText("COMPLICATION")).not.toBeInTheDocument();
    vi.restoreAllMocks();
  });
  it("puts a tapped Complication in the Fixer's (opposition) pool and rolls it with the Fixer's dice", () => {
    vi.mocked(persistence.loadMode).mockReturnValue("play");
    render(<App />, { wrapper: NuqsTestingAdapter });
    fireEvent.click(screen.getByText("IMPORT / EXPORT"));
    fireEvent.change(screen.getByPlaceholderText("Paste character JSON here..."), {
      target: {
        value: JSON.stringify({
          ...defaultCharacter,
          complications: [{ id: "c", name: "Alarm", die: "10" }],
        }),
      },
    });
    fireEvent.click(screen.getByText(/Load Data/i));
    fireEvent.click(screen.getByText("Alarm"));
    const opposition = screen.getByRole("group", { name: /opposition/i });
    expect(within(opposition).getByText("d10")).toBeInTheDocument();
    expect(within(opposition).getByText("Alarm")).toBeInTheDocument();
    // Fixer base 2d6 + Alarm d10, Math.random 0.5 => 4, 4 and 6: stakes = 6 + 4
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    fireEvent.click(screen.getByRole("button", { name: /Roll for Fixer/i }));
    expect(screen.getByLabelText("Stakes")).toHaveValue(10);
    vi.restoreAllMocks();
  });
  it("opens the JSON modal with the complete Leverage schema", () => {
    render(<App />, { wrapper: NuqsTestingAdapter });
    fireEvent.click(screen.getByText("IMPORT / EXPORT"));
    expect(screen.getByText("JSON Import / Export")).toBeInTheDocument();
    expect(screen.getByDisplayValue(/"roles"/)).toBeInTheDocument();
  });
  describe("Tactical Terminal interactions", () => {
    const loadSheet = (patch: object) => {
      fireEvent.click(screen.getByText("IMPORT / EXPORT"));
      fireEvent.change(screen.getByPlaceholderText("Paste character JSON here..."), {
        target: { value: JSON.stringify({ ...defaultCharacter, ...patch }) },
      });
      fireEvent.click(screen.getByText(/Load Data/i));
    };

    it("themes the sheet by the focused Role", () => {
      const { container } = render(<App />, { wrapper: NuqsTestingAdapter });
      const root = container.firstElementChild as HTMLElement;
      expect(root).toHaveAttribute("data-role", "grifter");
      fireEvent.click(screen.getByRole("button", { name: "Thief", pressed: false }));
      expect(root).toHaveAttribute("data-role", "thief");
      expect(screen.getByRole("button", { name: "Thief" })).toHaveAttribute("aria-pressed", "true");
    });

    it("spends a Plot Point from a chip", () => {
      render(<App />, { wrapper: NuqsTestingAdapter });
      fireEvent.click(screen.getByRole("button", { name: /Spend Plot Point 1 of 1/ }));
      expect(screen.getByLabelText("Plot Points")).toHaveValue(0);
      expect(screen.getByRole("button", { name: "Spend a Plot Point" })).toBeDisabled();
    });

    it("flashback toggles monochrome mode and costs 1 Plot Point for a d6 Asset", () => {
      render(<App />, { wrapper: NuqsTestingAdapter });
      fireEvent.click(screen.getByRole("button", { name: "Establishment Flashback" }));
      expect(document.body).toHaveClass("flashback-mode");
      expect(screen.getByTestId("flashback-overlay")).toBeInTheDocument();
      fireEvent.change(screen.getByLabelText("Asset established"), { target: { value: "Rigged lock" } });
      fireEvent.click(screen.getByRole("button", { name: /Pay 1 Plot Point/ }));
      expect(screen.getByLabelText("Plot Points")).toHaveValue(0);
      expect(screen.getByText("Rigged lock")).toBeInTheDocument();
      expect(document.body).not.toHaveClass("flashback-mode");
    });

    it("does not let a flashback Asset be bought with no Plot Points", () => {
      render(<App />, { wrapper: NuqsTestingAdapter });
      loadSheet({ pp: 0 });
      fireEvent.click(screen.getByRole("button", { name: "Establishment Flashback" }));
      expect(screen.getByRole("button", { name: /Pay 1 Plot Point/ })).toBeDisabled();
    });

    it("steps an Asset up and down and caps at d12", () => {
      render(<App />, { wrapper: NuqsTestingAdapter });
      loadSheet({ assets: [{ id: "a", name: "Gadget", die: "10" }] });
      fireEvent.click(screen.getByRole("button", { name: /Step up Gadget/ }));
      expect(screen.getByRole("button", { name: /Gadget, d12/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Step up Gadget/ })).toBeDisabled();
      fireEvent.click(screen.getByRole("button", { name: /Step down Gadget/ }));
      expect(screen.getByRole("button", { name: /Gadget, d10/ })).toBeInTheDocument();
    });

    it("offers blank 'up your sleeve' Specialty slots and declaring one earns a Plot Point", () => {
      render(<App />, { wrapper: NuqsTestingAdapter });
      expect(screen.getByText(/Up your sleeve: 2 blank slots/)).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Declare in a flashback" }));
      fireEvent.change(screen.getByLabelText("Book example"), { target: { value: "0" } });
      expect(screen.getByLabelText("Specialty")).toHaveValue("Explosives");
      fireEvent.click(screen.getByRole("button", { name: /Add Specialty/ }));
      expect(screen.getByText("Explosives")).toBeInTheDocument();
      expect(screen.getByLabelText("Plot Points")).toHaveValue(2);
      expect(screen.getByText(/Up your sleeve: 1 blank slot$/)).toBeInTheDocument();
    });

    it("rolls Fixer stakes and shows the outcome banner", () => {
      vi.mocked(persistence.loadMode).mockReturnValue("play");
      render(<App />, { wrapper: NuqsTestingAdapter });
      fireEvent.click(screen.getByRole("button", { name: /^Hacker, d8/ }));
      fireEvent.change(screen.getByLabelText("Stakes"), { target: { value: "3" } });
      vi.spyOn(Math, "random").mockReturnValue(0.9); // d8 -> 8, d6 -> 6
      fireEvent.click(screen.getByText("ROLL POOL"));
      expect(screen.getByTestId("outcome-banner")).toHaveAttribute("data-outcome", "extraordinary");
      fireEvent.click(screen.getByRole("button", { name: "Roll for Fixer" }));
      expect(screen.getByLabelText("Stakes")).toHaveValue(12);
      vi.restoreAllMocks();
    });
  });
});
