import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "*.e2e.ts",
  // The repo is bind-mounted into a root container; keep its output out of the tree.
  outputDir: "/tmp/playwright-results",
  timeout: 60_000,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.BASE_URL,
    browserName: "chromium",
  },
});
