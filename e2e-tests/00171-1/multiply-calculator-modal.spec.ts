import { test, expect } from "@playwright/test";

test.describe("곱셈 계산기 모달", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("페이지 최하단에 곱셈 계산기 섹션이 존재한다", async ({ page }) => {
    const section = page.locator("#section-multiply");
    await expect(section).toBeVisible();

    const triggerButton = page.locator("#multiply-trigger");
    await expect(triggerButton).toBeVisible();
  });

  test("트리거 버튼 클릭 시 모달이 열린다", async ({ page }) => {
    const modal = page.locator("#multiply-modal");
    await expect(modal).toBeHidden();

    await page.locator("#multiply-trigger").click();
    await expect(modal).toBeVisible();

    await expect(page.locator("#multiply-input-a")).toBeVisible();
    await expect(page.locator("#multiply-input-b")).toBeVisible();
    await expect(page.locator("#multiply-calc-button")).toBeVisible();
    await expect(page.locator("#multiply-output")).toBeVisible();
    await expect(page.locator("#multiply-confirm-button")).toBeVisible();
  });

  test("두 숫자 입력 후 계산 버튼 클릭 시 5초 후 곱 결과가 출력된다", async ({ page }) => {
    await page.locator("#multiply-trigger").click();

    await page.locator("#multiply-input-a").fill("6");
    await page.locator("#multiply-input-b").fill("7");
    await page.locator("#multiply-calc-button").click();

    // 계산 버튼이 비활성화되어야 함
    await expect(page.locator("#multiply-calc-button")).toBeDisabled();

    // '계산 중...' 텍스트 표시
    await expect(page.locator("#multiply-output")).toHaveText("계산 중...");

    // 5초 후 결과 표시 (최대 8초 대기)
    await expect(page.locator("#multiply-output")).toHaveText(/6\s*×\s*7\s*=\s*42/, { timeout: 8000 });

    // 계산 버튼 다시 활성화
    await expect(page.locator("#multiply-calc-button")).toBeEnabled();
  });

  test("확인 버튼 클릭 시 모달이 닫히고 입력값이 초기화된다", async ({ page }) => {
    await page.locator("#multiply-trigger").click();

    await page.locator("#multiply-input-a").fill("3");
    await page.locator("#multiply-input-b").fill("4");

    await page.locator("#multiply-confirm-button").click();

    const modal = page.locator("#multiply-modal");
    await expect(modal).toBeHidden();

    // 모달 재오픈 후 초기화 확인
    await page.locator("#multiply-trigger").click();
    await expect(page.locator("#multiply-input-a")).toHaveValue("");
    await expect(page.locator("#multiply-input-b")).toHaveValue("");
    await expect(page.locator("#multiply-output")).toHaveText("");
  });

  test("빈 값으로 계산 버튼 클릭 시 오류 메시지가 표시된다", async ({ page }) => {
    await page.locator("#multiply-trigger").click();
    await page.locator("#multiply-calc-button").click();

    await expect(page.locator("#multiply-output")).toHaveText("두 숫자를 모두 입력해주세요.");
  });

  test("모달 외부(오버레이) 클릭 시 모달이 닫힌다", async ({ page }) => {
    await page.locator("#multiply-trigger").click();
    await expect(page.locator("#multiply-modal")).toBeVisible();

    // 오버레이 영역(모달 바깥) 클릭
    await page.locator("#multiply-modal").click({ position: { x: 10, y: 10 } });
    await expect(page.locator("#multiply-modal")).toBeHidden();
  });
});
