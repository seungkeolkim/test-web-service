import { test, expect } from "@playwright/test";

test.describe("13번째 동물 버튼 (수달)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("수달 버튼이 페이지에 존재한다", async ({ page }) => {
    const btn = page.locator("#animal-btn-13");
    await expect(btn).toBeVisible();
    await expect(btn).toContainText("수달");
  });

  test("수달 버튼에 올바른 이모지(🦦)가 포함되어 있다", async ({ page }) => {
    const btn = page.locator("#animal-btn-13");
    await expect(btn).toContainText("🦦");
  });

  test("수달 버튼이 animal-button-thirteenth 클래스를 가진다", async ({ page }) => {
    const btn = page.locator("#animal-btn-13");
    await expect(btn).toHaveClass(/animal-button-thirteenth/);
  });

  test("수달 버튼 클릭 시 오류 없이 동작한다", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    const btn = page.locator("#animal-btn-13");
    await btn.click();

    expect(errors).toHaveLength(0);
  });

  test("수달 버튼은 기존 12개 버튼들과 함께 렌더링된다", async ({ page }) => {
    for (let i = 1; i <= 13; i++) {
      const btn = page.locator(`#animal-btn-${i}`);
      await expect(btn).toBeVisible();
    }
  });

  test("기존 단위 변환 기능(길이)이 정상 동작한다", async ({ page }) => {
    const input = page.locator("#length-input");
    await input.fill("100");
    await page.locator("#length-button").click();
    const result = page.locator("#length-result");
    await expect(result).not.toBeEmpty();
  });
});
