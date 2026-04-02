/**
 * 2026 中国法定节假日 & 调休上班日
 */

// 法定节假日（放假日期）
export const HOLIDAYS_2026: string[] = [
  // 元旦 1/1-1/3
  "2026-01-01", "2026-01-02", "2026-01-03",
  // 春节 2/15-2/23
  "2026-02-15", "2026-02-16", "2026-02-17", "2026-02-18",
  "2026-02-19", "2026-02-20", "2026-02-21", "2026-02-22", "2026-02-23",
  // 清明节 4/4-4/6
  "2026-04-04", "2026-04-05", "2026-04-06",
  // 劳动节 5/1-5/5
  "2026-05-01", "2026-05-02", "2026-05-03", "2026-05-04", "2026-05-05",
  // 端午节 6/19-6/21
  "2026-06-19", "2026-06-20", "2026-06-21",
  // 中秋节 9/25-9/27
  "2026-09-25", "2026-09-26", "2026-09-27",
  // 国庆节 10/1-10/7
  "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04",
  "2026-10-05", "2026-10-06", "2026-10-07",
];

// 调休上班日（周末变工作日）
export const MAKEUP_WORKDAYS_2026: string[] = [
  "2026-01-04", // 元旦调休
  "2026-02-14", // 春节调休
  "2026-02-28", // 春节调休
  "2026-05-09", // 劳动节调休
  "2026-09-20", // 国庆调休
  "2026-10-10", // 国庆调休
];

// 节假日名称映射
export const HOLIDAY_NAMES: Record<string, string> = {
  "2026-01": "元旦",
  "2026-02": "春节",
  "2026-04": "清明节",
  "2026-05": "劳动节",
  "2026-06": "端午节",
  "2026-09": "中秋节",
  "2026-10": "国庆节",
};

const holidaySet = new Set(HOLIDAYS_2026);
const makeupSet = new Set(MAKEUP_WORKDAYS_2026);

export function isHoliday(dateStr: string): boolean {
  return holidaySet.has(dateStr);
}

export function isMakeupWorkday(dateStr: string): boolean {
  return makeupSet.has(dateStr);
}

/** 判断某天是否为工作日（考虑法定节假日和调休） */
export function isWorkday(date: Date): boolean {
  const dateStr = date.toISOString().slice(0, 10);
  // 法定假日 → 非工作日
  if (isHoliday(dateStr)) return false;
  // 调休上班 → 工作日
  if (isMakeupWorkday(dateStr)) return true;
  // 普通周末
  const dow = date.getDay();
  return dow !== 0 && dow !== 6;
}

/** 获取某月的统计信息 */
export function getMonthStats(year: number, month: number) {
  const totalDays = new Date(year, month, 0).getDate();
  let workdays = 0;
  let holidaysInMonth: string[] = [];
  let makeupInMonth: string[] = [];

  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month - 1, d);
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    if (isHoliday(dateStr)) {
      holidaysInMonth.push(dateStr);
    }
    if (isMakeupWorkday(dateStr)) {
      makeupInMonth.push(dateStr);
    }
    if (isWorkday(date)) {
      workdays++;
    }
  }

  return { totalDays, workdays, holidays: holidaysInMonth, makeupDays: makeupInMonth };
}
