import { defineConfig } from "@playwright/test";

/**
 * End-to-end tests against the production build (`next start`) talking to the
 * real Neon database and Neon Auth. Uses the locally installed Microsoft Edge,
 * so no browser download is needed.
 *
 *   npm run build && npm run test:e2e
 *
 * Tests create throwaway accounts and change seeded rows; run `pnpm db:seed`
 * afterwards to reset the demo data.
 */
const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: "msedge",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
