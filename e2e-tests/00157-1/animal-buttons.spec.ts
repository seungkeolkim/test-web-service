import { test, expect } from "@playwright/test";

test.describe("동물 버튼 기본 검증 (static)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("페이지가 정상 로드된다", async ({ page }) => {
    await expect(page).toHaveTitle(/단위 변환기/);
  });

  test("동��� 소리 섹션이 존재한다", async ({ page }) => {
    const section = page.locator("#section-animal-sounds");
    await expect(section).toBeVisible();
  });

  test("동물 버튼이 최소 1개 이상 존재한다", async ({ page }) => {
    const buttons = page.locator("#section-animal-sounds .animal-button");
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("각 동물 버튼을 클릭해도 에러가 발생하지 않는다", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    const buttons = page.locator("#section-animal-sounds .animal-button");
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      await buttons.nth(i).click();
      await page.waitForTimeout(300);
    }

    expect(consoleErrors).toHaveLength(0);
  });

  test("단위 변환 폼이 존재한다", async ({ page }) => {
    const forms = page.locator("form, .converter, [class*=convert]");
    const count = await forms.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
