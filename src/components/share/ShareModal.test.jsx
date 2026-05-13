import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ShareModal } from "./ShareModal";

// Mock navigator.clipboard
const writeTextMock = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: writeTextMock },
  });
  writeTextMock.mockClear();
});

describe("ShareModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    pollCode: "ABC123",
  };

  it("renders nothing when closed", () => {
    const { container } = render(
      <BrowserRouter>
        <ShareModal {...defaultProps} isOpen={false} />
      </BrowserRouter>
    );
    expect(container.querySelector("h2")).toBeNull();
  });

  it("renders modal title and QR code when open", () => {
    render(
      <BrowserRouter>
        <ShareModal {...defaultProps} />
      </BrowserRouter>
    );
    expect(screen.getByText("Share Poll")).toBeInTheDocument();
    // QR code SVG should be rendered
    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  it("displays the share URL containing the poll code", () => {
    render(
      <BrowserRouter>
        <ShareModal {...defaultProps} />
      </BrowserRouter>
    );
    // The URL is rendered in a truncated <p> — use getAllByText and check at least one exists
    const urlElements = screen.getAllByText(/ABC123/);
    expect(urlElements.length).toBeGreaterThan(0);
  });

  it("calls writeText when copy button is clicked", async () => {
    render(
      <BrowserRouter>
        <ShareModal {...defaultProps} />
      </BrowserRouter>
    );

    // The last button (not the close X) is the copy button
    const buttons = screen.getAllByRole("button");
    const copyButton = buttons[buttons.length - 1];
    fireEvent.click(copyButton);
    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
    });
  });
});
