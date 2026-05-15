import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth, User } from "./AuthContext";
import API from "../services/api";
import { ReactNode } from "react";

// Mock the API service
vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const TestComponent = () => {
  const { user, loading, login, logout } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return (
    <div>
      <div data-testid="no-user">No User</div>
      <button onClick={() => login({ email: "test@test.com", password: "password" })}>Login</button>
    </div>
  );
  return (
    <div>
      <div data-testid="user-name">{user.name}</div>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  const mockUser: User = {
    _id: "123",
    name: "Test User",
    email: "test@test.com",
    avatar: "avatar.png",
    role: "user",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("checks login status on mount", async () => {
    (API.get as any).mockResolvedValueOnce({ data: mockUser });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestid("user-name")).toHaveTextContent("Test User");
    });

    expect(API.get).toHaveBeenCalledWith("/auth/me");
  });

  it("handles login successfully", async () => {
    (API.get as any).mockRejectedValueOnce(new Error("Unauthorized"));
    (API.post as any).mockResolvedValueOnce({ data: mockUser });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestid("no-user")).toBeInTheDocument();
    });

    screen.getByText("Login").click();

    await waitFor(() => {
      expect(screen.getByTestid("user-name")).toHaveTextContent("Test User");
    });

    expect(API.post).toHaveBeenCalledWith("/auth/login", {
      email: "test@test.com",
      password: "password",
    });
  });

  it("handles logout", async () => {
    (API.get as any).mockResolvedValueOnce({ data: mockUser });
    (API.post as any).mockResolvedValueOnce({});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestid("user-name")).toBeInTheDocument();
    });

    screen.getByText("Logout").click();

    await waitFor(() => {
      expect(screen.getByTestid("no-user")).toBeInTheDocument();
    });

    expect(API.post).toHaveBeenCalledWith("/auth/logout");
  });
});
