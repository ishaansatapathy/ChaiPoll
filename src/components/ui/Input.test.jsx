import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Input } from "./Input";

describe("Input", () => {
  it("renders with label", () => {
    render(
      <BrowserRouter>
        <Input label="Email" type="email" />
      </BrowserRouter>
    );
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("accepts user input", () => {
    render(
      <BrowserRouter>
        <Input label="Name" type="text" />
      </BrowserRouter>
    );
    const input = screen.getByLabelText("Name");
    fireEvent.change(input, { target: { value: "Test User" } });
    expect(input).toHaveValue("Test User");
  });
});
