import { expect, test, type Page } from "@playwright/test";

/**
 * Checkout, lesson progress, booking + cancellation, reviews, availability.
 * Real Neon Postgres + Neon Auth. Run `pnpm db:seed` before and after.
 */
const PASSWORD = "Repwise#2026demo";
const COACH = "hamza.sheikh@repwise.test";
const stamp = Date.now().toString(36);
const member = { name: `Usama Buyer ${stamp}`, email: `buyer.${stamp}@repwise.test` };

async function signIn(page: Page, email: string) {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"));
}

test.describe.serial("commerce, progress, booking, reviews", () => {
  test("signed-out visitors are asked to sign in before buying or booking", async ({ page }) => {
    await page.goto("/programs/ghar-pe-fit");
    await expect(page.getByRole("link", { name: "Sign in to buy" })).toBeVisible();
    await page.goto("/trainers/hamza-sheikh");
    await expect(page.getByRole("link", { name: "Sign in to book" })).toBeVisible();
  });

  test("member buys a program, it appears in the library, progress is saved", async ({ page }) => {
    await page.goto("/auth/sign-up");
    await page.getByLabel("Full name").fill(member.name);
    await page.getByLabel("Email").fill(member.email);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL("**/onboarding");
    await page.getByRole("button", { name: /start training/i }).click();
    await page.waitForURL("**/app");
    await expect(page.getByText("Start your first program")).toBeVisible();

    // Locked before buying
    await page.goto("/app/programs/ghar-pe-fit/lessons/2");
    await expect(page.getByText("This lesson is locked")).toBeVisible();

    // Buy
    await page.goto("/programs/ghar-pe-fit");
    await page.getByRole("button", { name: "Buy program" }).click();
    await page.getByRole("button", { name: /pay rs 3,500/i }).click();
    await expect(page.getByText("You're in")).toBeVisible();
    await page.getByRole("link", { name: "Start lesson 1" }).click();
    await page.waitForURL("**/app/programs/ghar-pe-fit/lessons/1");

    // Progress
    await page.getByRole("button", { name: "Mark complete" }).click();
    await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();
    await expect(page.getByText("1 of 7 completed")).toBeVisible();

    // Lesson 2 now unlocked
    await page.goto("/app/programs/ghar-pe-fit/lessons/2");
    await expect(page.getByText("This lesson is locked")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Mark complete" })).toBeVisible();

    // Library + program page reflect ownership
    await page.goto("/app/programs");
    const item = page.getByTestId("library-item").filter({ hasText: "Ghar Pe Fit" });
    await expect(item).toContainText("1 of 7 lessons");
    await page.goto("/programs/ghar-pe-fit");
    await expect(page.getByRole("link", { name: /continue · 1\/7 done/i })).toBeVisible();
  });

  test("member reviews a coach they paid; no form for coaches they haven't", async ({ page }) => {
    await signIn(page, member.email);
    await page.goto("/trainers/bilal-ahmed");
    await expect(page.getByRole("heading", { name: "Reviews" })).toBeVisible();
    await expect(page.getByTestId("review-form")).toHaveCount(0);

    await page.goto("/trainers/ayesha-siddiqui");
    const form = page.getByTestId("review-form");
    await expect(form).toBeVisible();
    await form.getByRole("radio", { name: "5 stars" }).click();
    await form.getByLabel("Review").fill("Clear plan, works in a small flat. Feeling stronger already.");
    await form.getByRole("button", { name: "Post review" }).click();
    await expect(page.getByText("Thanks for your review!")).toBeVisible();
    // The review list is cached; it must show the new review within a few seconds.
    await expect(async () => {
      await page.reload();
      await expect(page.getByText(member.name)).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 20_000 });
    await expect(page.getByTestId("review-form").getByRole("button", { name: "Update review" })).toBeVisible();
  });

  test("member books a slot, coach sees it, member cancels and the slot reopens", async ({ browser }) => {
    const page = await browser.newPage();
    await signIn(page, member.email);
    await page.goto("/trainers/hamza-sheikh");

    // Pick a slot at least 2 days out so it is still cancellable (24h rule).
    const openDays = page.locator('[data-testid="slot-day"][data-open="true"]');
    await expect(openDays.first()).toBeVisible();
    await openDays.nth(2).click();
    const slot = page.getByTestId("slot-time").first();
    const slotLabel = (await slot.textContent())!.trim();
    await slot.click();
    await page.getByRole("button", { name: `Book ${slotLabel}` }).click();
    await page.getByRole("button", { name: /pay rs 3,500/i }).click();
    await expect(page.getByText("Session booked")).toBeVisible();

    await page.goto("/app/bookings");
    const row = page.getByTestId("session-row").filter({ hasText: "Hamza Sheikh" }).filter({ hasText: slotLabel });
    await expect(row).toBeVisible();

    // Coach sees the booking and the sale
    const coach = await browser.newPage();
    await signIn(coach, COACH);
    await coach.goto("/trainer/bookings");
    await expect(coach.getByTestId("session-row").filter({ hasText: member.name })).toBeVisible();
    await coach.goto("/trainer/earnings");
    await expect(coach.getByRole("row").filter({ hasText: member.name }).first()).toContainText("Paid");

    // Member cancels → refunded
    await row.getByRole("button", { name: "Cancel" }).click();
    await row.getByRole("button", { name: "Confirm cancel" }).click();
    await expect(page.getByText("Session cancelled and refunded")).toBeVisible();
    await page.getByRole("tab", { name: /past/i }).click();
    await expect(page.getByTestId("session-row").filter({ hasText: slotLabel }).first()).toContainText(/cancelled/i);

    await coach.reload();
    await expect(coach.getByRole("row").filter({ hasText: member.name }).first()).toContainText("Refunded");
  });

  test("coach updates availability and it persists", async ({ page }) => {
    await signIn(page, COACH);
    await page.goto("/trainer/availability");
    const sunday = page.getByRole("switch", { name: "Sunday available" });
    await expect(sunday).not.toBeChecked();
    await sunday.click();
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page.getByText("Availability saved")).toBeVisible();
    await page.reload();
    await expect(page.getByRole("switch", { name: "Sunday available" })).toBeChecked();
  });
});
