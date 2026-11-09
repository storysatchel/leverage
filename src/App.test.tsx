import { render, screen, fireEvent } from "@testing-library/react";
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
    for (const name of [
      "Hacker",
      "Agility",
      "Locks",
      "Custom Talent",
      "Gadget",
      "Alarm",
    ])
      fireEvent.click(screen.getByText(name));
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    fireEvent.click(screen.getByText("ROLL POOL"));
    for (const result of [
      "Hacker: d12 = 7",
      "Agility: d10 = 6",
      "Locks (Hacker): d8 = 5",
      "Custom Talent: d4 = 3",
      "Gadget: d12 = 7",
      "Alarm: d10 = 6",
    ])
      expect(screen.getByText(result)).toBeInTheDocument();
    vi.restoreAllMocks();
  });
  it("opens the JSON modal with the complete Leverage schema", () => {
    render(<App />, { wrapper: NuqsTestingAdapter });
    fireEvent.click(screen.getByText("IMPORT / EXPORT"));
    expect(screen.getByText("JSON Import / Export")).toBeInTheDocument();
    expect(screen.getByDisplayValue(/"roles"/)).toBeInTheDocument();
  });
});
