/**
 * 캘린더용 최소 날짜 유틸.
 * 해커톤 번들·러닝커브를 아껴서 date 라이브러리를 쓰지 않는다.
 * 로컬 타임존 기준으로만 다루고 UTC 변환은 하지 않는다 — 캘린더는 사용자 로컬 날짜가 전부다.
 */

export const DOW_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

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

/**
 * "2026-08-08"에서 오늘까지 며칠 지났는지. 시술일 당일이 0이다.
 *
 * 서버가 D-day를 안 줄 때 대신 계산하는 데 쓴다 — 서버의 D+8(시술일 8/8, 오늘 8/16)과
 * 같은 셈법이다. 날짜를 못 읽으면 null이라 호출부가 판단한다.
 */
export function daysSince(dateKey: string): number | null {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return null;

  const from = startOfDay(new Date(y, m - 1, d));
  if (Number.isNaN(from.getTime())) return null;

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(new Date()).getTime() - from.getTime()) / MS_PER_DAY);
}

/** "8월 3일 (월)" */
export function formatDayLabel(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${DOW_LABELS[date.getDay()]})`;
}

/**
 * "8월 19일" — 블록 제목에 끼워 쓰는 짧은 날짜.
 *
 * `formatDayLabel`은 요일까지 붙어("8월 19일 (수)") 제목 안에 넣으면 길다.
 * 브리핑 카드처럼 날짜가 주인공인 자리는 그쪽을, 제목 앞에 붙는 자리는 이쪽을 쓴다.
 */
export function formatShortDayLabel(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
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

/* ── 폼 날짜 입력(DateField)용 — "YYYY.MM.DD" 문자열 포맷 ──────────────── */

/** "YYYY.MM.DD" → 네이티브 date input이 요구하는 "YYYY-MM-DD" */
export function toDateInputValue(date: string): string {
  return date.replaceAll('.', '-');
}

/** "YYYY-MM-DD"(네이티브 date input 값) → 앱 표준 포맷 "YYYY.MM.DD" */
export function fromDateInputValue(value: string): string {
  return value.replaceAll('-', '.');
}

/** "YYYY.MM.DD" → "YYYY. MM. DD (요일)" 화면 표시용. 파싱 실패하면 원본을 그대로 보여준다. */
export function formatDateDisplay(date: string): string {
  const [y, m, d] = date.split('.');
  if (!y || !m || !d) return date;

  const parsed = new Date(Number(y), Number(m) - 1, Number(d));
  if (Number.isNaN(parsed.getTime())) return date;

  return `${y}. ${m}. ${d} (${DOW_LABELS[parsed.getDay()]})`;
}

/* ── 일정 시간 입력용 — 자유 텍스트 → API가 요구하는 "HH:mm:ss" ────────── */

/**
 * "19:00", "오후 7:00" 같은 자유 텍스트를 "HH:mm:ss"로 최대한 정규화한다.
 * 시간 입력이 자유 텍스트 필드라 형식을 보장할 수 없다 — 파싱에 실패하면 원본을 그대로 돌려준다.
 * TODO: BE가 실제로 어떤 형식까지 허용하는지 확인되면 이 파서는 정리한다.
 */
export function toEventTime(time: string): string {
  const trimmed = time.trim();

  const plain = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (plain) {
    const [, h, m, s] = plain;
    return `${h.padStart(2, '0')}:${m}:${s ?? '00'}`;
  }

  const korean = trimmed.match(/^(오전|오후)\s*(\d{1,2}):(\d{2})$/);
  if (korean) {
    const [, period, h, m] = korean;
    const hour = (Number(h) % 12) + (period === '오후' ? 12 : 0);
    return `${String(hour).padStart(2, '0')}:${m}:00`;
  }

  return trimmed;
}
