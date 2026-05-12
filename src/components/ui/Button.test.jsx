import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Button } from "./Button.jsx";

describe("Button", () => {
  it("renders a native button", () => {
    render(
      <BrowserRouter>
        <Button type="button">Submit</Button>
      </BrowserRouter>
    );
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("renders a link when `to` is set", () => {
    render(
      <BrowserRouter>
        <Button to="/home">Home</Button>
      </BrowserRouter>
    );
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("href", "/home");
  });
});
