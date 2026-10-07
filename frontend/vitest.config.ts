import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Next.js owns the application build, so this file exists only for the component
// tests. It carries the same `@` alias as tsconfig.json: without it a test
// importing `@/lib/ui` resolves nothing and fails for the wrong reason.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    // Component tests only. Scoped to `src/` so the Playwright specs in `e2e/`
    // -- which match the default `*.spec.ts` pattern -- are left to Playwright;
    // collected here they fail on Playwright's own fixtures.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    css: false,
    // Coverage is measured by the sprint's test check and reported as a
    // json-summary the platform reads back for the development dashboard.
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      reportsDirectory: "./coverage",
    },
  },
});
