/**
 * 단위 변환기 핵심 로직
 *
 * 각 카테고리(길이, 무게, 부피)에 대한 단위 변환 함수를 제공합니다.
 * DOM 조작은 이 파일에 포함되지 않으며, 순수 변환 로직만 담당합니다.
 */

// ─────────────────────────────────────────────
// Web Audio API: AudioContext (lazy 초기화)
// 브라우저 autoplay 정책으로 인해 사용자 인터랙션 이후에만 생성 가능
// ─────────────────────────────────────────────

/** AudioContext 인스턴스 (최초 사용 시 생성, 이후 재사용) */
let audioCtx = null;

/**
 * AudioContext를 반환한다. 아직 생성되지 않은 경우 새로 생성한다 (lazy 초기화).
 * 브라우저 autoplay 정책에 따라 사용자 인터랙션 이후에 호출해야 한다.
 *
 * @returns {AudioContext} Web Audio API AudioContext 인스턴스
 */
function getAudioContext() {
  if (!audioCtx) {
    // 브라우저 호환성을 위해 webkit 접두사 버전도 대응
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * 지정한 주파수·파형·길이로 비프음을 재생한다.
 *
 * 재생 흐름: OscillatorNode → GainNode → destination
 * GainNode로 클릭 잡음(click noise)을 줄이기 위해 음량을 부드럽게 감소시킨다.
 *
 * @param {number} frequency - 재생할 주파수 (Hz). 예: 440 (라, A4)
 * @param {string} type      - 파형 종류. 'sine' | 'square' | 'sawtooth' | 'triangle'
 * @param {number} duration  - 재생 시간 (초). 예: 0.3
 */
function playBeep(frequency, type, duration) {
  const context   = getAudioContext();
  const oscillator = context.createOscillator();
  const gainNode   = context.createGain();

  // 오실레이터 설정
  oscillator.type      = type;
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);

  // 음량: 즉시 1.0으로 시작, 재생 종료 시점에 0으로 서서히 감소 (클릭 잡음 방지)
  gainNode.gain.setValueAtTime(1.0, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

  // 연결: 오실레이터 → 게인 → 출력
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  // 재생 시작 및 종료 예약
  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + duration);
}

/**
 * 길이 단위를 기준 단위(m, 미터)로 변환하는 계수 테이블
 * 각 값은 해당 단위 1단위 = 몇 미터인지를 나타냄
 */
const LENGTH_TO_METER = {
  cm:   0.01,
  m:    1,
  km:   1000,
  inch: 0.0254,
  feet: 0.3048,
  mile: 1609.344,
};

/**
 * 무게 단위를 기준 단위(kg, 킬로그램)로 변환하는 계수 테이블
 * 각 값은 해당 단위 1단위 = 몇 킬로그램인지를 나타냄
 */
const WEIGHT_TO_KG = {
  kg: 1,
  lb: 0.45359237,
};

/**
 * 부피 단위를 기준 단위(L, 리터)로 변환하는 계수 테이블
 * 각 값은 해당 단위 1단위 = 몇 리터인지를 나타냄
 */
const VOLUME_TO_LITER = {
  L:   1,
  gal: 3.785411784,
};

/**
 * 속도 단위를 기준 단위(m/s, 미터/초)로 변환하는 계수 테이블
 * 각 값은 해당 단위 1단위 = 몇 m/s인지를 나타냄
 */
const SPEED_TO_MS = {
  'km/h': 1 / 3.6,
  'mph':  0.44704,
  'm/s':  1,
  'knot': 0.514444,
};

/**
 * 면적 단위를 기준 단위(m², 제곱미터)로 변환하는 계수 테이블
 * 각 값은 해당 단위 1단위 = 몇 m²인지를 나타냄
 *   m²   : 기준 단위 (1)
 *   ft²  : 1 ft² = 0.09290304 m²
 *   pyeong(평): 1평 = 3.305785 m²
 */
const AREA_TO_SQM = {
  'm2':     1,
  'ft2':    0.09290304,
  'pyeong': 3.305785,
};

/**
 * 데이터 크기 단위를 기준 단위(B, 바이트)로 변환하는 계수 테이블
 * 각 값은 해당 단위 1단위 = 몇 바이트인지를 나타냄
 *   B  : 기준 단위 (1)
 *   KB : 1 KB = 1024 B
 *   MB : 1 MB = 1024² B = 1,048,576 B
 *   GB : 1 GB = 1024³ B = 1,073,741,824 B
 *   TB : 1 TB = 1024⁴ B = 1,099,511,627,776 B
 */
const DATA_SIZE_TO_BYTE = {
  'B':  1,
  'KB': 1024,
  'MB': 1024 ** 2,
  'GB': 1024 ** 3,
  'TB': 1024 ** 4,
};

/**
 * 카테고리별 변환 계수 테이블을 반환한다
 * 온도(temperature)는 선형 계수 방식이 아니므로 null을 반환한다
 *
 * @param {string} category - 변환 카테고리 ('length' | 'weight' | 'volume' | 'temperature' | 'speed')
 * @returns {Object|null} 해당 카테고리의 변환 계수 테이블, 온도 또는 알 수 없는 카테고리면 null
 */
function getConversionTable(category) {
  switch (category) {
    case 'length': return LENGTH_TO_METER;
    case 'weight': return WEIGHT_TO_KG;
    case 'volume': return VOLUME_TO_LITER;
    case 'speed':  return SPEED_TO_MS;
    case 'area':     return AREA_TO_SQM;
    case 'dataSize': return DATA_SIZE_TO_BYTE;
    default:         return null;
  }
}

/**
 * 온도 값을 fromUnit에서 toUnit으로 변환한다
 *
 * 지원 단위: '°C' (섭씨), '°F' (화씨), 'K' (켈빈)
 * 변환 공식:
 *   °C → °F : F = C × 9/5 + 32
 *   °F → °C : C = (F - 32) × 5/9
 *   °C → K  : K = C + 273.15
 *   K  → °C : C = K - 273.15
 *   °F ↔ K  : °C를 중간 단위로 경유하여 변환
 *
 * @param {number} value    - 변환할 값
 * @param {string} fromUnit - 입력 단위 ('°C' | '°F' | 'K')
 * @param {string} toUnit   - 출력 단위 ('°C' | '°F' | 'K')
 * @returns {number|null} 변환된 값(소수점 최대 6자리 반올림), 지원하지 않는 단위면 null
 */
function convertTemperature(value, fromUnit, toUnit) {
  const supportedUnits = ['°C', '°F', 'K'];

  if (!supportedUnits.includes(fromUnit) || !supportedUnits.includes(toUnit)) {
    // 지원하지 않는 온도 단위
    return null;
  }

  // 동일 단위면 입력값 그대로 반환 (convert() 최상단에서도 처리하지만 방어적으로 포함)
  if (fromUnit === toUnit) {
    return parseFloat(value.toFixed(6));
  }

  // 1단계: fromUnit → 섭씨(°C)로 정규화
  let celsius;
  if (fromUnit === '°C') {
    celsius = value;
  } else if (fromUnit === '°F') {
    celsius = (value - 32) * 5 / 9;
  } else {
    // K → °C
    celsius = value - 273.15;
  }

  // 2단계: 섭씨(°C) → toUnit으로 변환
  let result;
  if (toUnit === '°C') {
    result = celsius;
  } else if (toUnit === '°F') {
    result = celsius * 9 / 5 + 32;
  } else {
    // °C → K
    result = celsius + 273.15;
  }

  return parseFloat(result.toFixed(6));
}

/**
 * 지정된 카테고리에서 숫자 값을 fromUnit에서 toUnit으로 변환한다
 *
 * 변환 방식:
 *   - 길이/무게/부피: fromUnit → 기준 단위 (계수 곱하기) → toUnit (계수 나누기)
 *   - 온도: convertTemperature()에 위임 (비선형 공식 사용)
 *
 * @param {string} category - 변환 카테고리 ('length' | 'weight' | 'volume' | 'temperature')
 * @param {number} value    - 변환할 값
 * @param {string} fromUnit - 입력 단위 (예: 'cm', 'kg', 'L', '°C')
 * @param {string} toUnit   - 출력 단위 (예: 'inch', 'lb', 'gal', '°F')
 * @returns {number|null} 변환된 값(소수점 최대 6자리 반올림), 오류 시 null
 */
function convert(category, value, fromUnit, toUnit) {
  // 입력값 유효성 검사
  if (typeof value !== 'number' || isNaN(value)) {
    return null;
  }

  // 온도는 선형 계수 방식이 아니므로 별도 함수로 처리
  if (category === 'temperature') {
    return convertTemperature(value, fromUnit, toUnit);
  }

  const conversionTable = getConversionTable(category);
  if (conversionTable === null) {
    // 알 수 없는 카테고리
    return null;
  }

  const fromFactor = conversionTable[fromUnit];
  const toFactor   = conversionTable[toUnit];

  if (fromFactor === undefined || toFactor === undefined) {
    // 지원하지 않는 단위
    return null;
  }

  // fromUnit → 기준 단위 → toUnit 순서로 변환
  const valueInBaseUnit = value * fromFactor;
  const convertedValue  = valueInBaseUnit / toFactor;

  // 소수점 최대 6자리로 반올림
  return parseFloat(convertedValue.toFixed(6));
}

/**
 * 특정 카테고리에서 지원하는 단위 목록을 반환한다
 * 온도는 계수 테이블을 사용하지 않으므로 단위 목록을 직접 반환한다
 *
 * @param {string} category - 변환 카테고리 ('length' | 'weight' | 'volume' | 'temperature')
 * @returns {string[]} 지원 단위 배열, 알 수 없는 카테고리면 빈 배열
 */
function getSupportedUnits(category) {
  // 온도는 계수 테이블이 없으므로 단위 목록을 직접 반환
  if (category === 'temperature') {
    return ['°C', '°F', 'K'];
  }

  const conversionTable = getConversionTable(category);
  if (conversionTable === null) {
    return [];
  }
  return Object.keys(conversionTable);
}

// ─────────────────────────────────────────────
// DOM 이벤트 바인딩
// ─────────────────────────────────────────────

/**
 * 변환 버튼 클릭 시 호출되는 핸들러
 *
 * 해당 카테고리의 입력값·출발 단위·도착 단위를 읽어
 * convert() 함수로 계산한 뒤 결과 영역에 텍스트를 표시한다.
 * 빈 입력이나 숫자가 아닌 값은 사용자 친화적 오류 메시지로 처리한다.
 *
 * @param {string} category - 변환 카테고리 ('length' | 'weight' | 'volume')
 */
function handleConvert(category) {
  const inputElement  = document.getElementById(category + '-input');
  const fromElement   = document.getElementById(category + '-from');
  const toElement     = document.getElementById(category + '-to');
  const resultElement = document.getElementById(category + '-result');

  const rawValue   = inputElement.value.trim();
  const inputValue = parseFloat(rawValue);

  // 빈 입력 또는 숫자가 아닌 값 처리
  if (rawValue === '' || isNaN(inputValue)) {
    resultElement.textContent = '숫자를 입력해주세요';
    resultElement.className   = 'result-display result-error';
    return;
  }

  const fromUnit = fromElement.value;
  const toUnit   = toElement.value;

  // 같은 단위끼리 변환하는 경우 입력값 그대로 표시
  if (fromUnit === toUnit) {
    resultElement.textContent = inputValue + ' ' + toUnit;
    resultElement.className   = 'result-display result-value';
    return;
  }

  // convert() 함수로 변환 수행
  const convertedValue = convert(category, inputValue, fromUnit, toUnit);

  if (convertedValue === null) {
    // 지원하지 않는 단위 등 변환 실패
    resultElement.textContent = '변환 오류가 발생했습니다';
    resultElement.className   = 'result-display result-error';
  } else {
    resultElement.textContent = convertedValue + ' ' + toUnit;
    resultElement.className   = 'result-display result-value';
  }
}

/**
 * DOM이 완전히 로드된 후 각 카테고리의 버튼 클릭 및 Enter 키 이벤트를 등록한다.
 * 동물 소리 버튼 이벤트도 함께 등록한다.
 */
document.addEventListener('DOMContentLoaded', function () {
  // ── 동물 소리 버튼 이벤트 등록 ──
  // animal-btn-1: 거북이 버튼 → 440Hz sine 파형 비프음 (0.3초)
  const animalButton1 = document.getElementById('animal-btn-1');
  if (animalButton1) {
    animalButton1.addEventListener('click', function () {
      playBeep(440, 'sine', 0.3);
    });
  }

  const categories = ['length', 'weight', 'volume', 'temperature', 'speed', 'area', 'dataSize'];

  categories.forEach(function (category) {
    // 변환 버튼 클릭 이벤트 등록
    const convertButton = document.getElementById(category + '-button');
    if (convertButton) {
      convertButton.addEventListener('click', function () {
        handleConvert(category);
      });
    }

    // 입력 필드에서 Enter 키를 눌러도 변환 실행
    const inputField = document.getElementById(category + '-input');
    if (inputField) {
      inputField.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          handleConvert(category);
        }
      });
    }
  });
});
