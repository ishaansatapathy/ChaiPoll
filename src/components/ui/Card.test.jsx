import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children", () => {
    render(
      <BrowserRouter>
        <Card>Card Content</Card>
      </BrowserRouter>
    );
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });
});
