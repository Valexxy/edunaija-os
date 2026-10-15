import { expect, test } from "@playwright/test";

test("home page describes the platform", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /learn better/i })).toBeVisible();
  await expect(page.getByText(/curriculum-aware learning/i)).toBeVisible();
});

test("health endpoint responds", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toMatchObject({ status: "ok" });
});
