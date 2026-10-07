import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Page from "./app/chat/page";

// The page is a client component and may navigate. There is no App Router
// outside the app, so the two hooks it can reach are stubbed.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {} }),
  usePathname: () => "/",
}));

describe("Chat", () => {
  it("renders without crashing", () => {
    const { container } = render(<Page />);
    expect(container.firstChild).not.toBeNull();
  });
});
