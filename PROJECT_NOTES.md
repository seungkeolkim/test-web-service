# PROJECT_NOTES.md

## 프로젝트 개요

순수 HTML/CSS/Vanilla JS로 구성된 클라이언트 사이드 단위 변환 웹 앱.  
DB·빌드 도구·외부 라이브러리 없이 브라우저만으로 동작한다.  
배경 이미지는 picsum.photos에서 동적으로 로드한다.

---

## 아키텍처

- **단일 페이지 구조**: `index.html` (UI) + `style.css` (스타일) + `script.js` (로직)
- **로직 분리**: `script.js` 상단에 순수 변환 함수(`convert`, `convertTemperature`, `getConversionTable`, `getSupportedUnits`)를 두고, DOM 이벤트 바인딩은 `DOMContentLoaded` 이후에 수행
- **변환 방식**: 길이/무게/부피/속도/면적/데이터 크기 → 기준 단위 계수 테이블(`const *_TO_*`) 방식으로 `fromUnit → 기준 단위 → toUnit` 순 변환; 온도는 비선형 공식으로 별도 처리(`convertTemperature`)
- **외부 의존성**: picsum.photos (배경 이미지 전용, 오프라인 시 폴백 배경색 `#f0f2f5` 유지)
- **실행 방법**: `bash run.sh` (Python3 내장 서버, 기본 포트 8080)

---

## 컨벤션

- **카테고리 ID 패턴**: HTML 요소 id는 `{category}-input`, `{category}-from`, `{category}-to`, `{category}-result`, `{category}-button` 형식을 일관되게 사용
- **카테고리 문자열 키**: `'length' | 'weight' | 'volume' | 'temperature' | 'speed' | 'area' | 'dataSize'` — JS 로직과 HTML id에 동일하게 사용
- **변환 계수 테이블 명명**: `{CATEGORY}_TO_{BASE_UNIT}` (예: `LENGTH_TO_METER`, `SPEED_TO_MS`)
- **결과 표시 CSS 클래스**: 정상 결과는 `result-value`, 오류는 `result-error` 클래스를 `result-display` 위에 추가
- **커밋 메시지**: `[{task_id}][tg:담당자] {task_id}-{subtask번호}: 변경 내용 한 줄`
- **header 장식 버튼**: 기능 없는 동물 이름 버튼들을 `<header>` 안에 배치; 특수 기능 버튼만 `id` 부여 (`btn-change-bg`, `btn-clear-bg`)

---

## 주요 결정

- **계수 테이블 방식 채택**: 모든 선형 단위를 "기준 단위 하나"로 환산하는 테이블로 관리. 새 단위 추가 시 테이블에 한 줄만 추가하면 돼 확장이 쉬움
- **온도를 별도 함수로 분리**: 온도는 선형 비례가 아니므로 `convertTemperature()`로 분리해 `convert()` 내부에서 위임. 다른 카테고리와 인터페이스는 통일
- **데이터 크기 이진 기반 (IEC)**: 1 KB = 1024 B 기준 채택. SI(1000 기반)가 아닌 실무 파일 시스템 표준에 맞춤
- **면적에 한국식 평(pyeong) 단위 포함**: 부동산·인테리어 실사용 요구를 반영
- **배경 이미지 캐시 우회**: `picsum.photos` URL에 `?t=Date.now()` 타임스탬프 추가. 매 로드·버튼 클릭 시 새 이미지 표시

---

## 최근 변경 이력

- [00148] memory_refresh: PROJECT_NOTES.md 최초 생성 — 2026-04-15
- [00147] 배경 이미지 랜덤 변경 버튼(Dolphin) 및 흰색 클리어 버튼(Polar Bear) 추가 — 2026-04-15
- [00146] header에 동물 이름 비활성 버튼(Otter) 추가 — 2026-04-15
- [00141] header 동물 이름 버튼 Falcon 추가, panda → grizzly 변경 — 2026-04-15
- [00139] header 동물 이름 버튼(Penguin) 추가 — 2026-04-15
- [00138] header 동물 이름 버튼 추가 — 2026-04-15
- [00137] 최상단 더미 버튼 전체 제거 — 2026-04-15
- [00136] 더미 버튼 추가 — 2026-04-15
- [00006] 데이터 크기(B/KB/MB/GB/TB) 변환 섹션 추가 — 초기
- [00005] 면적(m²/ft²/평) 변환 섹션 추가 — 초기
