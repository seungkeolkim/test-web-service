import { test, expect } from "@playwright/test";

test.describe("14번째 동물 버튼 (고슴도치)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("animal-btn-14 버튼이 존재한다", async ({ page }) => {
    const btn = page.locator("#animal-btn-14");
    await expect(btn).toBeVisible();
  });

  test("animal-btn-14 버튼에 올바른 텍스트가 표시된다", async ({ page }) => {
    const btn = page.locator("#animal-btn-14");
    await expect(btn).toContainText("고슴도치");
  });

  test("animal-btn-14 버튼이 animal-button-fourteenth 클래스를 가진다", async ({ page }) => {
    const btn = page.locator("#animal-btn-14");
    await expect(btn).toHaveClass(/animal-button-fourteenth/);
  });

  test("animal-btn-14 버튼이 section-animal-sounds 안에 있다", async ({ page }) => {
    const section = page.locator("#section-animal-sounds");
    const btn = section.locator("#animal-btn-14");
    await expect(btn).toBeVisible();
  });

  test("animal-btn-14 버튼 클릭 시 에러 없이 동작한다", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    const btn = page.locator("#animal-btn-14");
    await btn.click();

    // 짧은 대기 후 에러 없는지 확인
    await page.waitForTimeout(300);
    expect(errors).toHaveLength(0);
  });

  test("버튼이 14개 모두 존재한다", async ({ page }) => {
    for (let i = 1; i <= 14; i++) {
      const btn = page.locator(`#animal-btn-${i}`);
      await expect(btn).toBeVisible();
    }
  });
});
