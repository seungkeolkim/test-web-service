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
 *
 * @param {string} category - 변환 카테고리 ('length' | 'weight' | 'volume')
 * @returns {Object|null} 해당 카테고리의 변환 계수 테이블, 알 수 없는 카테고리면 null
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
 * 지정된 카테고리에서 숫자 값을 fromUnit에서 toUnit으로 변환한다
 *
 * 변환 방식:
 *   1. fromUnit → 기준 단위 (계수 곱하기)
 *   2. 기준 단위 → toUnit (계수 나누기)
 *
 * @param {string} category - 변환 카테고리 ('length' | 'weight' | 'volume')
 * @param {number} value    - 변환할 값
 * @param {string} fromUnit - 입력 단위 (예: 'cm', 'kg', 'L')
 * @param {string} toUnit   - 출력 단위 (예: 'inch', 'lb', 'gal')
 * @returns {number|null} 변환된 값(소수점 최대 6자리 반올림), 오류 시 null
 */
function convert(category, value, fromUnit, toUnit) {
  // 입력값 유효성 검사
  if (typeof value !== 'number' || isNaN(value)) {
    return null;
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
 *
 * @param {string} category - 변환 카테고리 ('length' | 'weight' | 'volume')
 * @returns {string[]} 지원 단위 배열, 알 수 없는 카테고리면 빈 배열
 */
function getSupportedUnits(category) {
  const conversionTable = getConversionTable(category);
  if (conversionTable === null) {
    return [];
  }
  return Object.keys(conversionTable);
}
