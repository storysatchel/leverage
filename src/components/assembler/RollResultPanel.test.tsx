import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RollResultPanel, type RolledDie } from "./RollResultPanel";

const dice = (...r: number[]): RolledDie[] =>
  r.map((result, i) => ({ id: String(i), value: 8, result }));

describe("RollResultPanel", () => {
  it("shows kept, unused and set-aside dice, and the total", () => {
    render(<RollResultPanel results={dice(8, 3, 5, 1)} extraIncluded={0} stakes={null} fixerOnes={0} />);
    expect(screen.getByTestId("leverage-total")).toHaveTextContent("TOTAL: 13");
    const items = within(screen.getByTestId("roll-result")).getAllByRole("listitem");
    expect(items.map((i) => i.getAttribute("data-status"))).toEqual(["kept", "unused", "kept", "one"]);
    expect(screen.queryByTestId("outcome-banner")).not.toBeInTheDocument();
  });

  it("is announced politely", () => {
    render(<RollResultPanel results={dice(4, 4)} extraIncluded={0} stakes={null} fixerOnes={0} />);
    expect(screen.getByTestId("roll-result")).toHaveAttribute("aria-live", "polite");
  });

  it.each([
    [13, 12, "success"],
    [12, 12, "miss"],
    [8, 12, "miss"],
    [17, 12, "extraordinary"],
  ])("total %i vs stakes %i is %s", (total, stakes, outcome) => {
    // two dice that sum to the total (both > 1)
    const a = Math.ceil(total / 2);
    render(<RollResultPanel results={dice(a, total - a)} extraIncluded={0} stakes={stakes} fixerOnes={0} />);
    expect(screen.getByTestId("outcome-banner")).toHaveAttribute("data-outcome", outcome);
  });

  it("explains a rolled 1 and lets the player accept the Complication", () => {
    const accept = vi.fn();
    render(
      <RollResultPanel results={dice(6, 5, 1)} extraIncluded={0} stakes={null} fixerOnes={0} onAcceptComplication={accept} />,
    );
    expect(screen.getByText(/Fixer may introduce a Complication/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /add d6 Complication/ }));
    expect(accept).toHaveBeenCalledTimes(1);
  });

  it("flags a Fixer 1 as an Opportunity", () => {
    render(<RollResultPanel results={dice(6, 5)} extraIncluded={0} stakes={7} fixerOnes={1} />);
    expect(screen.getByText(/Opportunity/)).toBeInTheDocument();
  });

  describe("including extra dice for Plot Points", () => {
    let include: () => void;
    beforeEach(() => {
      include = vi.fn();
    });
    it("offers an extra die only with a Plot Point and a spare die", () => {
      const { rerender } = render(
        <RollResultPanel results={dice(6, 5, 3)} extraIncluded={0} stakes={null} fixerOnes={0} plotPoints={1} onIncludeDie={include} />,
      );
      fireEvent.click(screen.getByRole("button", { name: /include another die/ }));
      expect(include).toHaveBeenCalled();
      rerender(
        <RollResultPanel results={dice(6, 5, 3)} extraIncluded={0} stakes={null} fixerOnes={0} plotPoints={0} onIncludeDie={include} />,
      );
      expect(screen.queryByRole("button", { name: /include another die/ })).not.toBeInTheDocument();
    });
    it("adds the extra die to the total", () => {
      render(<RollResultPanel results={dice(6, 5, 3)} extraIncluded={1} stakes={null} fixerOnes={0} />);
      expect(screen.getByTestId("leverage-total")).toHaveTextContent("TOTAL: 14");
    });
  });
});
