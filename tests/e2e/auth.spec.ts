import { expect, test, type Page } from "@playwright/test";

/**
 * Real Neon Auth + Neon Postgres, no mocks.
 * Demo accounts come from `pnpm db:seed`.
 */
const PASSWORD = "Repwise#2026demo";
const ADMIN = "admin@repwise.test";
const MEMBER = "ali.raza@repwise.test";
const COACH = "hamza.sheikh@repwise.test";

const stamp = Date.now().toString(36);
const newMember = { name: `Saad Test ${stamp}`, email: `member.${stamp}@repwise.test` };
const newCoach = { name: `Faraz Coach ${stamp}`, email: `coach.${stamp}@repwise.test` };
const newCoachSlug = newCoach.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

async function signIn(page: Page, email: string, password = PASSWORD) {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"));
}

async function signUp(page: Page, name: string, email: string) {
  await page.goto("/auth/sign-up");
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/onboarding");
}

async function signOut(page: Page) {
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: /sign out/i }).click();
  await page.waitForURL((url) => url.pathname === "/");
}

test.describe.serial("authentication & roles", () => {
  test("signed-out visitors are kept out of private areas", async ({ page, request }) => {
    for (const path of ["/app", "/trainer", "/admin/applications", "/onboarding"]) {
      await page.goto(path);
      await expect(page, `${path} should redirect`).toHaveURL(/\/auth\/sign-in/);
    }
    const session = await request.get("/api/auth/get-session");
    expect(session.ok()).toBeTruthy();
    expect(await session.json()).toBeNull();
  });

  test("public pages render coaches from the database", async ({ page }) => {
    await page.goto("/trainers");
    // 8 seeded coaches + 1 seeded application that is already approved.
    await expect(page.getByText(/^\d+ coaches available$/)).toHaveText("9 coaches available");
    await expect(page.getByRole("heading", { name: "Hamza Sheikh" })).toBeVisible();
    await page.goto("/trainers/hamza-sheikh");
    await expect(page.getByRole("heading", { name: "Desi Strength 12" })).toBeVisible();
  });

  test("wrong password shows an invalid-credentials message", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.getByLabel("Email").fill(MEMBER);
    await page.getByLabel("Password").fill("not-the-password");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test("new member: sign up → onboarding → dashboard, survives reload, signs out", async ({ page }) => {
    await signUp(page, newMember.name, newMember.email);
    await page.getByRole("button", { name: /start training/i }).click();
    await page.waitForURL("**/app");
    await expect(page.getByRole("heading", { name: /salam, saad/i })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", { name: /salam, saad/i })).toBeVisible();

    await signOut(page);
    await page.goto("/app");
    await expect(page).toHaveURL(/\/auth\/sign-in/);

    await signIn(page, newMember.email);
    await expect(page).toHaveURL(/\/app$/);
  });

  test("seeded member reads and updates notifications in Postgres", async ({ page }) => {
    await signIn(page, MEMBER);
    await page.goto("/app/notifications");
    await expect(page.getByText("2 unread")).toBeVisible();
    await page.getByRole("button", { name: "Mark all as read" }).click();
    await expect(page.getByText("You're all caught up")).toBeVisible();
  });

  test("roles are enforced: members can't open coach or admin areas", async ({ page }) => {
    await signIn(page, MEMBER);
    await page.goto("/trainer");
    await expect(page).toHaveURL(/\/app$/);
    await page.goto("/admin/applications");
    await expect(page).toHaveURL(/\/app$/);
  });

  test("coach applies → pending → admin approves → coach is live", async ({ browser }) => {
    // 1. Apply
    const coach = await browser.newPage();
    await signUp(coach, newCoach.name, newCoach.email);
    await coach.getByRole("button", { name: /i am a coach/i }).click();
    await coach.getByRole("button", { name: "Continue" }).click();
    await coach.getByLabel("City").fill("Peshawar");
    await coach.getByLabel("Years of experience").fill("6");
    await coach.getByLabel("Headline").fill("Calisthenics coach for busy students");
    await coach
      .getByLabel("About you")
      .fill("Certified calisthenics coach. I run a street-workout group in Hayatabad and coach online since 2024.");
    await coach.getByLabel("Session price (Rs)").fill("2500");
    await coach.getByRole("button", { name: /submit application/i }).click();
    await coach.waitForURL("**/trainer");
    await expect(coach.getByRole("heading", { name: /application under review/i })).toBeVisible();

    // Not public yet. (The page streams, so notFound() renders the 404 UI with a
    // 200 status plus a noindex tag; assert on content, not status.)
    const pub = await browser.newPage();
    await pub.goto(`/trainers/${newCoachSlug}`);
    await expect(pub.getByText("This page is still warming up")).toBeVisible();
    await expect(pub.getByRole("heading", { name: newCoach.name })).toHaveCount(0);

    // 2. Admin approves
    const admin = await browser.newPage();
    await signIn(admin, ADMIN);
    await expect(admin).toHaveURL(/\/admin\/applications/);
    const card = admin.getByTestId("application").filter({ hasText: newCoach.name });
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: "Approve" }).click();
    await expect(admin.getByText(`${newCoach.name} approved`)).toBeVisible();

    // 3. Coach dashboard unlocks
    await coach.reload();
    await expect(coach.getByRole("heading", { name: /salam, faraz/i })).toBeVisible();

    // 4. Coach is in the public directory
    await pub.goto(`/trainers/${newCoachSlug}`);
    await expect(pub.getByRole("heading", { name: newCoach.name })).toBeVisible();
    await expect(pub.getByText("Calisthenics coach for busy students")).toBeVisible();
  });

  test("coach edits their profile and the public page updates", async ({ page }) => {
    const headline = `Strength coach for busy Lahore professionals ${stamp}`;
    await signIn(page, COACH);
    await expect(page).toHaveURL(/\/trainer$/);
    await page.goto("/trainer/profile");
    await page.getByLabel("Headline").fill(headline);
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page.getByText("Profile saved")).toBeVisible();

    await page.goto("/trainers/hamza-sheikh");
    await expect(page.getByText(headline)).toBeVisible();
  });

  test("admins are routed to the admin area", async ({ page }) => {
    await signIn(page, ADMIN);
    await page.goto("/app");
    await expect(page).toHaveURL(/\/admin\/applications/);
  });
});
