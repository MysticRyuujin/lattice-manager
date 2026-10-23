import { expect, Page, test } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "";
const relay = process.env.EXPECTED_RELAY ?? "";
const expectNginx = process.env.EXPECT_NGINX === "1";
const customRelay = "https://relay.smoke.invalid";

// Screens after connect need a paired Lattice1, so this covers only what loads before it.

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

async function blockExternal(page: Page) {
  const external: string[] = [];
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith(baseURL)) return route.continue();
    external.push(url);
    return route.fulfill({ status: 503, body: "blocked by smoke test" });
  });
  return external;
}

async function submitConnect(page: Page) {
  await page.locator("#deviceIdInput").fill("smoke1");
  await page.locator("#passwordInput").fill("smoke-test-password");
  await page.getByRole("button", { name: "Connect" }).click();
}

test.beforeAll(async ({ request }) => {
  for (let i = 0; i < 60; i++) {
    const ok = await request.get("/").then((r) => r.ok(), () => false);
    if (ok) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`app did not answer at ${baseURL}`);
});

test("loads the connect form without errors", async ({ page }) => {
  const errors = collectErrors(page);
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  await blockExternal(page);

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Lattice Manager");
  await expect(page.locator("#deviceIdInput")).toBeVisible();
  await expect(page.locator("#passwordInput")).toBeVisible();
  await expect(page.getByRole("button", { name: "Connect" })).toBeVisible();

  expect(errors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("connect goes to the default relay", async ({ page }) => {
  const errors = collectErrors(page);
  const external = await blockExternal(page);
  await page.goto("/");
  await submitConnect(page);

  await expect
    .poll(() => external.some((u) => u.startsWith(`${relay}/`)), { timeout: 30_000 })
    .toBe(true);
  await expect(page.locator("body")).not.toBeEmpty();
  expect(errors).toEqual([]);
});

test("a saved Connection Endpoint wins over the default", async ({ page }) => {
  const errors = collectErrors(page);
  await page.addInitScript((endpoint) => {
    window.localStorage.setItem(
      "gridplus",
      JSON.stringify({ settings: { customEndpoint: endpoint } })
    );
  }, customRelay);
  const external = await blockExternal(page);
  await page.goto("/");
  await submitConnect(page);

  await expect
    .poll(() => external.some((u) => u.startsWith(`${customRelay}/`)), { timeout: 30_000 })
    .toBe(true);
  expect(external.filter((u) => u.startsWith(`${relay}/`))).toEqual([]);
  expect(errors).toEqual([]);
});

test("serves assets and falls back to index.html", async ({ request }) => {
  const index = await request.get("/");
  const html = await index.text();
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
  expect(assets.length).toBeGreaterThan(0);
  for (const asset of assets) {
    const res = await request.get(asset);
    expect(res.status(), asset).toBe(200);
    if (expectNginx) expect(res.headers()["cache-control"], asset).toContain("immutable");
  }
  if (expectNginx) expect(index.headers()["cache-control"]).toContain("no-cache");

  const deep = await request.get("/no/such/page");
  expect(deep.status()).toBe(200);
  expect(await deep.text()).toContain("<title>Lattice Manager</title>");
});
