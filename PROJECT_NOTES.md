# PROJECT_NOTES.md

> 이 파일은 Memory Updater가 관리하는 장기 메모리 문서입니다.
> 코드 자체로 알 수 있는 내용은 기록하지 않고, 결정 근거·컨벤션·변경 흐름만 기록합니다.

---

## 프로젝트 개요

- 순수 HTML/CSS/Vanilla JS로 구성된 단위 변환기 웹 페이지
- DB 없음, 빌드 도구 없음, 외부 라이브러리 없음 — 클라이언트 사이드 전용
- 지원 카테고리: 길이(length), 무게(weight), 부피(volume), 온도(temperature), 속도(speed), 면적(area), 데이터크기(dataSize) — 총 7가지
- 로컬 실행: `bash run.sh` (Python3 기반, 기본 포트 8080, 브라우저 자동 오픈)

---

## 아키텍처

- **파일 구조**: `index.html` (UI 마크업) / `style.css` (스타일) / `script.js` (변환 로직 + DOM 이벤트) / `run.sh` (로컬 서버 실행)
- **변환 로직 패턴**: 선형 단위는 `{카테고리}_TO_{기준단위}` 상수 테이블을 통해 "→ 기준 단위 → 목표 단위"로 2단계 변환. 온도는 비선형이므로 `convertTemperature()` 함수로 분리 처리 (°C를 중간 단위로 경유)
- **DOM ID 규칙**: `{category}-input`, `{category}-from`, `{category}-to`, `{category}-button`, `{category}-result` 패턴으로 일관 적용
- **배경**: 고정 CSS 배경색(`#f0f2f5`) 사용. 배경 이미지 기능 없음
- **비프음 유틸리티**: `playBeep(frequency, type, duration)` + lazy `getAudioContext()` 패턴으로 Web Audio API 캡슐화. AudioContext는 브라우저 autoplay 정책으로 인해 최초 사용자 인터랙션 시점에 생성
- **랜덤 비프음 패턴**: 버튼별로 고정 파라미터 대신 클릭 시마다 주파수(200~1200Hz)·파형(sine/square/triangle/sawtooth)·지속시간(0.15~0.5s)을 난수로 결정해 `playBeep()`에 전달하는 방식 도입 (00155 부엉이 버튼부터 적용)

---

## 컨벤션

- **카테고리 식별자**: 소문자 camelCase (`length`, `weight`, `volume`, `temperature`, `speed`, `area`, `dataSize`) — DOM ID와 JS 내부 식별자 일치
- **변환 계수 테이블 네이밍**: `{CATEGORY}_TO_{BASE_UNIT}` (예: `LENGTH_TO_METER`, `SPEED_TO_MS`)
- **결과 표시 CSS 클래스**: 성공 시 `result-value`, 오류 시 `result-error`를 `result-display`에 추가
- **데이터 크기 계산**: 1KB = 1024B (IEC 이진 기반) 사용 — 십진 기반(SI) 아님
- **면적**: 한국 부동산 단위 `평(pyeong)` 지원 (1평 = 3.305785 m²)
- **Enter 키 지원**: 모든 입력 필드에서 Enter 입력 시 변환 버튼 클릭과 동일하게 동작
- **커밋 형식**: `[{task_id}][tg:{요청자}] {subtask_num}: {변경 내용 한 줄}`

---

## 주요 결정

- **프레임워크 미사용**: 심플한 도구 특성상 의존성 없이 순수 HTML/CSS/JS로 유지. 빌드 파이프라인 오버헤드를 피하기 위함
- **온도 변환 분리**: 선형 계수 방식으로 처리 불가하므로 `convertTemperature()` 별도 함수로 분리. 다른 카테고리와 패턴 통일성은 `getConversionTable()`이 `null` 반환으로 분기

---

## 최근 변경 이력

- [00162] 아홉 번째 동물 버튼 추가 및 랜덤 비프음 연결 — 2026-04-17
- [00160] 여덟 번째 동물 버튼 추가 및 랜덤 비프음 연결 — 2026-04-17
- [00158] 일곱 번째 동물 버튼 추가 및 랜덤 비프음 연결 — 2026-04-17
- [00157] 여섯 번째 동물 버튼 추가 및 랜덤 비프음 연결 — 2026-04-17
- [00156] 다섯 번째 동물 버튼 추가 및 랜덤 비프음 연결 — 2026-04-17
- [00155] 네 번째 동물 버튼(🦉 부엉이) 추가 — 클릭마다 주파수·파형·지속시간을 랜덤 생성하는 최초의 동적 비프음 버튼 — 2026-04-17
- [00153] 세 번째 동물 버튼(🐬 돌고래) 추가 — 880Hz triangle 파형으로 기존 두 버튼과 파형·주파수 모두 다르게 구분 — 2026-04-17
- [00151] 동물 이름 버튼 2개 추가 및 Web Audio API 기반 비프음 구현 (거북이: 440Hz sine, 두 번째 동물: 다른 주파수/파형) — 2026-04-16
- [00150] header 동물 이름 버튼 전체 제거 및 배경 이미지 기능(picsum) 완전 삭제 — 2026-04-15
- [00147] header에 랜덤 배경 변경(Dolphin) 및 배경 클리어(Polar Bear) 기능 버튼 추가 — 2026-04-15
