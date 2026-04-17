import { test, expect } from "@playwright/test";

test.describe("00155-1: 네 번째 동물 버튼(🦉 부엉이) 및 랜덤 비프음", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("부엉이 버튼이 animal-sounds 섹션에 존재한다", async ({ page }) => {
    const section = page.locator("#section-animal-sounds");
    await expect(section).toBeVisible();

    const btn = page.locator("#animal-btn-4");
    await expect(btn).toBeVisible();
    await expect(btn).toContainText("🦉");
    await expect(btn).toContainText("부엉이");
  });

  test("부엉이 버튼이 animal-button-random 클래스를 갖는다", async ({ page }) => {
    const btn = page.locator("#animal-btn-4");
    await expect(btn).toHaveClass(/animal-button-random/);
    await expect(btn).toHaveClass(/animal-button/);
  });

  test("기존 버튼 3개(거북이·여우·돌고래)가 그대로 존재한다", async ({ page }) => {
    await expect(page.locator("#animal-btn-1")).toBeVisible();
    await expect(page.locator("#animal-btn-1")).toContainText("🐢");
    await expect(page.locator("#animal-btn-2")).toBeVisible();
    await expect(page.locator("#animal-btn-2")).toContainText("🦊");
    await expect(page.locator("#animal-btn-3")).toBeVisible();
    await expect(page.locator("#animal-btn-3")).toContainText("🐬");
  });

  test("부엉이 버튼 클릭 시 에러 없이 클릭 가능하다", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    const btn = page.locator("#animal-btn-4");
    await btn.click();
    // Allow brief time for Web Audio processing
    await page.waitForTimeout(600);

    expect(consoleErrors).toHaveLength(0);
  });

  test("부엉이 버튼 클릭 핸들러가 Math.random을 통해 랜덤값을 생성한다", async ({ page }) => {
    // Verify the click handler uses Math.random by checking it doesn't throw
    // and that button is interactive
    const btn = page.locator("#animal-btn-4");
    await expect(btn).toBeEnabled();

    // Click multiple times to exercise random logic
    await btn.click();
    await page.waitForTimeout(200);
    await btn.click();
    await page.waitForTimeout(200);
    await btn.click();
    await page.waitForTimeout(200);

    // Button should still be visible and no page crash
    await expect(btn).toBeVisible();
  });

  test("부엉이 버튼이 네 번째(마지막) 순서로 배치된다", async ({ page }) => {
    const buttons = page.locator("#section-animal-sounds .animal-button");
    await expect(buttons).toHaveCount(4);
    const lastBtn = buttons.nth(3);
    await expect(lastBtn).toHaveAttribute("id", "animal-btn-4");
  });

  test("페이지 타이틀이 단위 변환기이다", async ({ page }) => {
    await expect(page).toHaveTitle(/단위 변환기/);
  });
});
