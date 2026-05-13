import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(
      <BrowserRouter>
        <Badge>Active</Badge>
      </BrowserRouter>
    );
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <BrowserRouter>
        <Badge className="bg-red-500">Test</Badge>
      </BrowserRouter>
    );
    const el = screen.getByText("Test");
    expect(el.className).toContain("bg-red-500");
  });
});
