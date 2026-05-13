import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <BrowserRouter>
        <EmptyState title="No Polls" description="Create your first poll" />
      </BrowserRouter>
    );
    expect(screen.getByText("No Polls")).toBeInTheDocument();
    expect(screen.getByText("Create your first poll")).toBeInTheDocument();
  });
});
