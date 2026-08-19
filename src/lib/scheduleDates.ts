/**
 * 직접 입력한 일정이 있는 날짜들.
 *
 * **서버에 이걸 물어볼 방법이 없다.** 날짜 범위로 일정을 주는 엔드포인트는
 * `/api/v1/today/calendar/events` 하나뿐인데, 그건 스웨거 설명 그대로 "구글 캘린더 연동
 * 토큰을 이용해" 구글 일정만 읽는다. 직접 입력한 일정은 브리핑 응답에 실려 오지만
 * 브리핑은 하루치라, 달력에 점을 찍으려고 42일치를 부를 수는 없다.
 *
 * 그래서 우리가 아는 것만 기억한다 — 이 브라우저에서 넣거나 고친 일정, 그리고
 * 날짜를 열어 브리핑으로 확인한 일정. 서버가 범위 조회를 내주면 이 파일은 사라진다(BE 문의).
 *
 * 한계를 분명히 해둔다: **다른 기기에서 넣은 일정은 그 날짜를 열어보기 전까지 점이 안 찍힌다.**
 * 대신 잘못 찍히지는 않는다 — 브리핑을 받을 때마다 그 날짜의 사실로 덮어쓰기 때문이다.
 */

const STORAGE_KEY = 'schedule-dates';

type Listener = () => void;
const listeners = new Set<Listener>();

/**
 * 스냅샷은 캐시해서 같은 참조를 돌려준다.
 * `useSyncExternalStore`는 getSnapshot이 매번 새 값을 주면 무한 렌더로 판단한다.
 */
let snapshot: ReadonlySet<string> = read();

function read(): ReadonlySet<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    // 저장 형식이 바뀌었거나 손상됐으면 버린다 — 점 몇 개 때문에 화면이 죽을 이유가 없다
    return Array.isArray(parsed) ? new Set(parsed.filter((v) => typeof v === 'string')) : new Set();
  } catch {
    return new Set();
  }
}

function write(next: ReadonlySet<string>): void {
  snapshot = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  } catch {
    // 저장 공간이 없거나 사파리 프라이빗 모드. 이번 세션 동안은 메모리에 남으므로 그대로 진행한다.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeScheduleDates(listener: Listener): () => void {
  listeners.add(listener);

  // 다른 탭에서 일정을 넣었을 때. key가 null이면 clear()라 통째로 다시 읽는다.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) {
      snapshot = read();
      listener();
    }
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function getScheduleDates(): ReadonlySet<string> {
  return snapshot;
}

/** 일정을 넣거나 고친 날짜(YYYY-MM-DD)를 기억한다 */
export function rememberScheduleDate(date: string): void {
  if (!date || snapshot.has(date)) return;
  write(new Set(snapshot).add(date));
}

/**
 * 그 날짜의 사실로 덮어쓴다 — 브리핑이 알려준 대로.
 *
 * 삭제한 날짜를 지우는 것도 이 경로다. 삭제 직후 브리핑을 다시 받으므로,
 * 마지막 일정을 지웠으면 `hasSchedules=false`로 돌아와 점이 사라진다.
 */
export function syncScheduleDate(date: string, hasSchedules: boolean): void {
  if (!date) return;
  if (hasSchedules === snapshot.has(date)) return;

  const next = new Set(snapshot);
  if (hasSchedules) next.add(date);
  else next.delete(date);
  write(next);
}
