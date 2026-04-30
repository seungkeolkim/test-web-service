import { test, expect } from "@playwright/test";

const VALID_BACKGROUNDS = [
  "assets/backgrounds/harbor.jpg",
  "assets/backgrounds/bus-terminal.jpg",
];

test.describe("랜덤 배경화면 기능", () => {
  test("페이지 로드 시 body에 배경 이미지가 설정된다", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const bgImage = await page.evaluate(
      () => document.body.style.backgroundImage
    );

    expect(bgImage).toBeTruthy();
    expect(bgImage).not.toBe("");
  });

  test("배경 이미지가 두 후보 중 하나여야 한다", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const bgImage = await page.evaluate(
      () => document.body.style.backgroundImage
    );

    const isValidBackground = VALID_BACKGROUNDS.some((path) =>
      bgImage.includes(path)
    );
    expect(
      isValidBackground,
      `배경 이미지 "${bgImage}"가 유효한 후보 목록에 없음: ${VALID_BACKGROUNDS.join(", ")}`
    ).toBe(true);
  });

  test("harbor.jpg 파일이 서버에서 정상 제공된다", async ({ page }) => {
    const response = await page.request.get("/assets/backgrounds/harbor.jpg");
    expect(
      response.status(),
      "harbor.jpg HTTP 응답이 200이어야 함"
    ).toBe(200);
  });

  test("bus-terminal.jpg 파일이 서버에서 정상 제공된다", async ({ page }) => {
    const response = await page.request.get(
      "/assets/backgrounds/bus-terminal.jpg"
    );
    expect(
      response.status(),
      "bus-terminal.jpg HTTP 응답이 200이어야 함"
    ).toBe(200);
  });

  test("CSS body 배경 보조 속성이 올바르게 설정된다", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const bodyStyles = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.body);
      return {
        backgroundSize: styles.backgroundSize,
        backgroundRepeat: styles.backgroundRepeat,
        backgroundAttachment: styles.backgroundAttachment,
      };
    });

    expect(bodyStyles.backgroundSize).toBe("cover");
    expect(bodyStyles.backgroundRepeat).toBe("no-repeat");
    expect(bodyStyles.backgroundAttachment).toBe("fixed");
  });

  test("여러 번 로드 시 두 이미지가 모두 선택될 수 있다 (랜덤성 검증)", async ({
    page,
  }) => {
    const selectedImages = new Set<string>();
    const maxAttempts = 30;

    for (let i = 0; i < maxAttempts; i++) {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      const bgImage = await page.evaluate(
        () => document.body.style.backgroundImage
      );

      for (const candidate of VALID_BACKGROUNDS) {
        if (bgImage.includes(candidate)) {
          selectedImages.add(candidate);
        }
      }

      if (selectedImages.size === VALID_BACKGROUNDS.length) {
        break;
      }
    }

    expect(
      selectedImages.size,
      `${maxAttempts}회 로드 중 두 이미지가 모두 선택되어야 함. 실제 선택된 이미지: ${[...selectedImages].join(", ")}`
    ).toBe(VALID_BACKGROUNDS.length);
  });
});
