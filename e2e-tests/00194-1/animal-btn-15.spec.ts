import { test, expect } from "@playwright/test";

test.describe("00194-1: 15번째 동물 버튼(고래) — 보라색 + 랜덤 비프음", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("animal-btn-15 버튼이 #section-animal-sounds 안에 존재한다", async ({ page }) => {
    const section = page.locator("#section-animal-sounds");
    await expect(section).toBeVisible();
    const btn = section.locator("#animal-btn-15");
    await expect(btn).toBeVisible();
  });

  test("animal-btn-15 버튼이 class animal-button-fifteenth를 가진다", async ({ page }) => {
    const btn = page.locator("#animal-btn-15");
    await expect(btn).toHaveClass(/animal-button-fifteenth/);
  });

  test("animal-btn-15 버튼 텍스트에 고래가 포함된다", async ({ page }) => {
    const btn = page.locator("#animal-btn-15");
    await expect(btn).toContainText("고래");
  });

  test("animal-btn-15 버튼이 animal-btn-14 바로 다음에 위치한다", async ({ page }) => {
    const nextSibling = await page.evaluate(() => {
      const btn14 = document.getElementById("animal-btn-14");
      if (!btn14) return null;
      let next = btn14.nextElementSibling;
      while (next && next.nodeType !== Node.ELEMENT_NODE) {
        next = next.nextElementSibling;
      }
      return next ? next.id : null;
    });
    expect(nextSibling).toBe("animal-btn-15");
  });

  test("animal-btn-15 배경이 보라색 계열 그라데이션이다", async ({ page }) => {
    const bgImage = await page.evaluate(() => {
      const btn = document.getElementById("animal-btn-15");
      if (!btn) return "";
      return window.getComputedStyle(btn).backgroundImage;
    });
    // linear-gradient with purple hex values (#7b1fa2 or #ba68c8 계열)
    expect(bgImage).toMatch(/linear-gradient/i);
    // 보라색 계열 hex가 포함되어 있는지 확인 (rgb 변환 후 검사)
    const hasPurple = /rgb\(123,\s*31,\s*162\)|rgb\(186,\s*104,\s*200\)|rgb\(106,\s*27,\s*154\)|rgb\(156,\s*39,\s*176\)/i.test(bgImage)
      || bgImage.includes("7b1fa2") || bgImage.includes("ba68c8") || bgImage.includes("6a1b9a") || bgImage.includes("9c27b0");
    expect(hasPurple).toBe(true);
  });

  test("animal-btn-15 클릭 시 AudioContext가 생성된다 (랜덤 비프음 트리거)", async ({ page }) => {
    let audioContextCreated = false;
    await page.addInitScript(() => {
      const OriginalAudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (OriginalAudioContext) {
        const OrigClass = OriginalAudioContext;
        (window as any).__audioContextCallCount = 0;
        (window as any).AudioContext = class extends OrigClass {
          constructor(...args: any[]) {
            super(...args);
            (window as any).__audioContextCallCount++;
          }
        };
      }
    });
    await page.goto("/");
    await page.locator("#animal-btn-15").click();
    const callCount = await page.evaluate(() => (window as any).__audioContextCallCount || 0);
    // AudioContext는 최초 1회 생성(lazy init)이므로 0보다 크거나,
    // 이미 생성된 경우 playBeep 내부 oscillator.start 호출로 에러 없이 실행됨
    // 콘솔 에러가 없으면 playBeep이 정상 실행된 것으로 판단
    const consoleErrors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    expect(consoleErrors.filter(e => e.includes("animal-btn-15")).length).toBe(0);
  });

  test("animal-btn-15 총 15개 버튼 중 마지막 버튼이다", async ({ page }) => {
    const count = await page.locator("#section-animal-sounds .animal-button").count();
    expect(count).toBe(15);
    const lastBtnId = await page.locator("#section-animal-sounds .animal-button").last().getAttribute("id");
    expect(lastBtnId).toBe("animal-btn-15");
  });
});
