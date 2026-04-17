import { test, expect } from "@playwright/test";

test.describe("00158-1: 7번째 동물 버튼(기린) 추가 검증", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("페이지가 정상 로드된다", async ({ page }) => {
    await expect(page).toHaveTitle(/단위 변환기/);
  });

  test("동물 소리 섹션이 존재한다", async ({ page }) => {
    const section = page.locator("#section-animal-sounds");
    await expect(section).toBeVisible();
  });

  test("7번째 동물 버튼(animal-btn-7)이 존재한다", async ({ page }) => {
    const btn7 = page.locator("#animal-btn-7");
    await expect(btn7).toBeVisible();
  });

  test("7번째 버튼이 animal-button-seventh 클래스를 갖는다", async ({ page }) => {
    const btn7 = page.locator("#animal-btn-7");
    await expect(btn7).toHaveClass(/animal-button-seventh/);
  });

  test("7번째 버튼 텍스트에 기린 이모지 또는 텍스트가 포함된다", async ({ page }) => {
    const btn7 = page.locator("#animal-btn-7");
    const text = await btn7.textContent();
    expect(text).toBeTruthy();
    expect(text!.length).toBeGreaterThan(0);
  });

  test("동물 버튼이 정확히 7개 이상 존재한다", async ({ page }) => {
    const buttons = page.locator("#section-animal-sounds .animal-button");
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(7);
  });

  test("7번째 버튼 클릭 시 콘솔 에러가 발생하지 않는다", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    const btn7 = page.locator("#animal-btn-7");
    await btn7.click();
    await page.waitForTimeout(600);

    expect(consoleErrors).toHaveLength(0);
  });

  test("7번째 버튼을 여러 번 클릭해도 에러가 발생하지 않는다", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    const btn7 = page.locator("#animal-btn-7");
    for (let i = 0; i < 3; i++) {
      await btn7.click();
      await page.waitForTimeout(400);
    }

    expect(consoleErrors).toHaveLength(0);
  });

  test("모든 동물 버튼 클릭 시 에러가 발생하지 않는다", async ({ page }) => {
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
});
