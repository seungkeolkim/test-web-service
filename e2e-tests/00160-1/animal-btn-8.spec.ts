import { test, expect } from "@playwright/test";

test.describe("00160-1: 여덟 번째 동물 버튼 (🐧 펭귄)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("animal-btn-8 버튼이 페이지에 존재한다", async ({ page }) => {
    const btn = page.locator("#animal-btn-8");
    await expect(btn).toBeVisible();
  });

  test("animal-btn-8 버튼 텍스트에 펭귄 이모지와 이름이 포함된다", async ({ page }) => {
    const btn = page.locator("#animal-btn-8");
    await expect(btn).toContainText("🐧");
    await expect(btn).toContainText("펭귄");
  });

  test("animal-btn-8에 animal-button-eighth 클래스가 적용되어 있다", async ({ page }) => {
    const btn = page.locator("#animal-btn-8");
    await expect(btn).toHaveClass(/animal-button-eighth/);
  });

  test("animal-btn-8가 #section-animal-sounds 섹션 내에 있다", async ({ page }) => {
    const section = page.locator("#section-animal-sounds");
    await expect(section).toBeVisible();
    const btn = section.locator("#animal-btn-8");
    await expect(btn).toBeVisible();
  });

  test("animal-btn-8 클릭 시 에러 없이 동작한다", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    const btn = page.locator("#animal-btn-8");
    await btn.click();
    // AudioContext는 브라우저 정책상 자동재생이 차단될 수 있으나 JS 에러는 없어야 함
    await page.waitForTimeout(600);
    expect(errors).toHaveLength(0);
  });

  test("animal-btn-8를 여러 번 클릭해도 에러가 발생하지 않는다", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    const btn = page.locator("#animal-btn-8");
    for (let i = 0; i < 3; i++) {
      await btn.click();
      await page.waitForTimeout(200);
    }
    expect(errors).toHaveLength(0);
  });

  test("동물 소리 섹션에 8개의 버튼이 모두 존재한다", async ({ page }) => {
    const section = page.locator("#section-animal-sounds");
    const buttons = section.locator("button.animal-button");
    await expect(buttons).toHaveCount(8);
  });
});
