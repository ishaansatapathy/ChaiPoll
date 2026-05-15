import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CreatePoll from "./CreatePoll";
import * as api from "../../services/api";

// Mock the API and useNavigate
vi.mock("../../services/api", () => ({
  createPoll: vi.fn(),
}));

const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("CreatePoll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the creation form", () => {
    render(
      <BrowserRouter>
        <CreatePoll />
      </BrowserRouter>
    );
    expect(screen.getAllByTestId("poll-title-input")[0]).toBeInTheDocument();
  });

  it("can add a new question", () => {
    render(
      <BrowserRouter>
        <CreatePoll />
      </BrowserRouter>
    );
    const addButton = screen.getAllByRole("button", { name: /ADD QUESTION/i })[0];
    fireEvent.click(addButton);
    // Initially 1 question, now should have 2
    const questionInputs = screen.getAllByPlaceholderText(/What are you asking\?/i);
    expect(questionInputs).toHaveLength(2);
  });

  it("submits the form successfully", async () => {
    vi.mocked(api.createPoll).mockResolvedValueOnce({ data: { pollCode: "ABCDEF" } });

    const { container } = render(
      <BrowserRouter>
        <CreatePoll />
      </BrowserRouter>
    );

    fireEvent.change(screen.getAllByTestId("poll-title-input")[0], {
      target: { value: "Test Poll" },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/What are you asking\?/i)[0], {
      target: { value: "What is 1+1?" },
    });
    
    // Fill options for the first question
    const optionInputs = screen.getAllByPlaceholderText(/Option \d/i);
    fireEvent.change(optionInputs[0], { target: { value: "2" } });
    fireEvent.change(optionInputs[1], { target: { value: "3" } });

    // Find the form and submit it
    const form = container.querySelector("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(api.createPoll).toHaveBeenCalled();
      expect(mockedNavigate).toHaveBeenCalledWith("/dashboard");
    }, { timeout: 4000 });
  });
});
