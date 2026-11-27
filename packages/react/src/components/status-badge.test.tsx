import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it.each(["success", "info", "warning", "danger", "neutral"] as const)(
    "renders %s intent with visible text and a redundant dot",
    intent => {
      render(<StatusBadge intent={intent}>已发布</StatusBadge>);
      const badge = screen.getByText("已发布");
      expect(badge).toHaveClass("mf-status-badge", `mf-status-badge--${intent}`);
      expect(badge.querySelector(".mf-status-badge__dot")).toHaveAttribute("aria-hidden", "true");
      // Status text is the accessible content; the dot must not carry meaning.
      expect(badge).toHaveTextContent("已发布");
    },
  );

  it("defaults to neutral", () => {
    render(<StatusBadge>草稿</StatusBadge>);
    expect(screen.getByText("草稿")).toHaveClass("mf-status-badge--neutral");
  });

  it("keeps long text readable via wrapping classes", () => {
    const longText = "ThisIsAnExtremelyLongEnglishCompoundWordWithoutBreakOpportunities";
    render(<StatusBadge intent="warning">{longText}</StatusBadge>);
    expect(screen.getByText(longText)).toBeInTheDocument();
  });
});
