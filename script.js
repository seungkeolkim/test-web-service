/**
 * 단위 변환기 핵심 로직
 *
 * 각 카테고리(길이, 무게, 부피)에 대한 단위 변환 함수를 제공합니다.
 * DOM 조작은 이 파일에 포함되지 않으며, 순수 변환 로직만 담당합니다.
 */

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
 * 카테고리별 변환 계수 테이블을 반환한다
 * 온도(temperature)는 선형 계수 방식이 아니므로 null을 반환한다
 *
 * @param {string} category - 변환 카테고리 ('length' | 'weight' | 'volume' | 'temperature')
 * @returns {Object|null} 해당 카테고리의 변환 계수 테이블, 온도 또는 알 수 없는 카테고리면 null
 */
function getConversionTable(category) {
  switch (category) {
    case 'length': return LENGTH_TO_METER;
    case 'weight': return WEIGHT_TO_KG;
    case 'volume': return VOLUME_TO_LITER;
    default:       return null;
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
 * DOM이 완전히 로드된 후 각 카테고리의 버튼 클릭 및 Enter 키 이벤트를 등록한다
 */
document.addEventListener('DOMContentLoaded', function () {
  const categories = ['length', 'weight', 'volume', 'temperature'];

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
