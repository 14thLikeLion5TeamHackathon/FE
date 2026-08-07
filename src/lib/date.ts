/**
 * 캘린더용 최소 날짜 유틸.
 * 해커톤 번들·러닝커브를 아껴서 date 라이브러리를 쓰지 않는다.
 * 로컬 타임존 기준으로만 다루고 UTC 변환은 하지 않는다 — 캘린더는 사용자 로컬 날짜가 전부다.
 */

const DOW = ['일', '월', '화', '수', '목', '금', '토'] as const;

export const DOW_LABELS = DOW;

/** 시/분/초를 버린 같은 날짜 */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = startOfDay(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number): Date {
  // 1일로 맞춘 뒤 이동한다. 31일에서 +1개월 하면 다음 달로 튀는 걸 막기 위함.
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

/** 그 주의 일요일 */
export function startOfWeek(date: Date): Date {
  const base = startOfDay(date);
  return addDays(base, -base.getDay());
}

/** YYYY-MM-DD — API·마킹 조회의 키로 쓴다 */
export function toKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return toKey(a) === toKey(b);
}

/** "8월 3일 (월)" */
export function formatDayLabel(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${DOW[date.getDay()]})`;
}

/** "2026년 8월" — 월 모드 헤더 */
export function formatMonthLabel(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

/** "8월" — 주 모드 헤더 */
export function formatShortMonthLabel(date: Date): string {
  return `${date.getMonth() + 1}월`;
}

/** 그 주 일요일부터 7일 */
export function weekDays(date: Date): Date[] {
  const sunday = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(sunday, i));
}

/**
 * 월 그리드. 6주 × 7일로 고정하고, 그 달에 속하지 않는 칸은 null이다.
 * null 칸은 이전/다음 달 날짜를 흐리게 보여주지 않고 비워 둔다(시안 기준).
 */
export function monthMatrix(date: Date): (Date | null)[][] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: lastDate }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length < 42) cells.push(null);

  return Array.from({ length: 6 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}
