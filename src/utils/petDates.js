/** ペットの日付文字列（YYYY/MM/DD など）を Date に変換 */
export function parsePetDateString(dateStr) {
  if (!dateStr || !String(dateStr).trim()) {
    return null;
  }
  const normalized = String(dateStr).trim().replace(/\//g, '-');
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

/** 開始日から終了日までの経過（カレンダー上の年・月・日） */
export function diffYearsMonthsDays(fromDate, toDate = new Date()) {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return null;
  }

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

/** 経過日数の終了日（お別れ日があればその日、なければ今日） */
export function getPetElapsedEndDate(farewellDateStr) {
  const farewell = parsePetDateString(farewellDateStr);
  if (farewell) {
    return farewell;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function formatPetElapsedLabel(dateStr, i18n, farewellDateStr) {
  const start = parsePetDateString(dateStr);
  if (!start) {
    return null;
  }
  const elapsed = diffYearsMonthsDays(start, getPetElapsedEndDate(farewellDateStr));
  if (!elapsed) {
    return null;
  }
  return i18n.t('petList.elapsedDuration', elapsed);
}

/** 一覧の名前横：年・月のみ（お誕生日からの年齢） */
export function formatPetAgeYearsMonthsLabel(dateStr, i18n, farewellDateStr) {
  const start = parsePetDateString(dateStr);
  if (!start) {
    return null;
  }
  const elapsed = diffYearsMonthsDays(start, getPetElapsedEndDate(farewellDateStr));
  if (!elapsed) {
    return null;
  }
  return i18n.t('petList.ageYearsMonths', {
    years: elapsed.years,
    months: elapsed.months,
  });
}

/** 表示用 YYYY/MM/DD */
export function formatPetDateDisplay(dateStr) {
  const parsed = parsePetDateString(dateStr);
  if (!parsed) {
    return '';
  }
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
}

export function getPetGenderSymbol(gender) {
  if (gender === '男の子') {
    return '♂';
  }
  if (gender === '女の子') {
    return '♀';
  }
  return '';
}

export function getPetGenderShortLabel(gender, i18n) {
  if (gender === '男の子') {
    return i18n.t('petList.genderMaleShort');
  }
  if (gender === '女の子') {
    return i18n.t('petList.genderFemaleShort');
  }
  return '';
}
