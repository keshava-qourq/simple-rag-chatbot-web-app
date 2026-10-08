import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import App from "./App";

// Screens import the shared `lib/navigate` helper, which calls next/navigation's
// useRouter. There is no Next app router outside the app directory, so it is
// stubbed here exactly as App.test.tsx stubs it for the chat page directly.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {} }),
  usePathname: () => "/",
}));

describe("App shell", () => {
  it("renders the shared workspace directly with chat, thread list and library reachable, no sign-in", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    // Root lands in the workspace shell: chat and library are both reachable.
    expect(screen.getByRole("link", { name: "Chat" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Document library" })).toBeInTheDocument();

    // Thread list and composer render on the chat screen (default route).
    expect(screen.getByRole("searchbox", { name: /search threads/i })).toBeInTheDocument();

    // A visible, plain statement that the workspace is shared and unauthenticated.
    expect(screen.getAllByText(/shared workspace/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/no sign-in/i).length).toBeGreaterThan(0);

    const forbidden = [
      /sign in/i,
      /sign up/i,
      /log in/i,
      /password/i,
      /invite/i,
      /continue as/i,
      /verify your email/i,
    ];
    const bodyText = document.body.textContent || "";
    forbidden.forEach((pattern) => {
      expect(bodyText).not.toMatch(pattern);
    });
  });

  it("stores no auth token, user object or session in storage", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
  });
});
