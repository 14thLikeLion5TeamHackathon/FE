import { z } from 'zod';

/**
 * 구글 캘린더 연동 상태.
 *
 * 스웨거가 응답을 `object`라고만 적어뒀는데, **서버 코드로 확정했다** —
 * 봉투(`success`·`code`·`message`·`data`)가 붙고 `data`는
 * `{ connectionId, googleEmail, status, connectedAt }`이며 미연동이면 `data: null`이다.
 * `status`는 `CONNECTED`/`DISCONNECTED` 문자열로 나간다.
 *
 * 그래도 판별을 여기서 느슨하게 하는 건 그대로 둔다 — 스펙에는 봉투 없는 맵으로 적혀
 * 있어서(`environment/weather`와 같은 예외) 서버가 스펙 쪽으로 되돌아갈 수 있고,
 * 그때 조용히 "미연동"으로 굳는 게 이 화면의 최악이다.
 *
 * 못 박지 않고 넓게 받는다. 여기서 파싱이 터지면 마이 탭이 통째로 죽는데,
 * 캘린더 연동 여부는 그만한 값이 아니다 — 모르면 미연동으로 두는 편이 낫다.
 */
export const CalendarStatus = z.unknown();
export type CalendarStatus = z.infer<typeof CalendarStatus>;

/** 어떤 형태로 오든 "연동됨"인지만 판단한다. 모르는 값은 미연동으로 본다. */
export function toCalendarConnected(raw: unknown): boolean {
  if (raw === null || raw === undefined) return false;
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'string') return raw.toUpperCase() === 'CONNECTED';

  if (typeof raw === 'object') {
    const value = raw as Record<string, unknown>;
    for (const key of ['status', 'calendarStatus', 'connected', 'isConnected']) {
      if (key in value) return toCalendarConnected(value[key]);
    }
    // 봉투에 담겨 온 경우. 한 겹 벗겨 다시 본다 — 봉투가 없으면 이 키 자체가 없어 그냥 지나간다.
    if ('data' in value) return toCalendarConnected(value.data);
  }

  return false;
}

/**
 * 연동된 구글 계정 주소. 없거나 모르면 null.
 *
 * 응답은 `data: { connectionId, googleEmail, status, connectedAt }` 모양이고 미연동이면
 * `data: null`이다(BE 확인). 여기서도 봉투 유무를 따지지 않는 건 `toCalendarConnected`와
 * 같은 이유다 — 형태가 어긋나도 화면이 죽지 않아야 한다.
 */
export function toCalendarEmail(raw: unknown): string | null {
  if (typeof raw !== 'object' || raw === null) return null;

  const value = raw as Record<string, unknown>;
  for (const key of ['googleEmail', 'email']) {
    const found = value[key];
    if (typeof found === 'string' && found.trim()) return found;
  }

  // 봉투에 담겨 온 경우. 한 겹 벗겨 다시 본다.
  return 'data' in value ? toCalendarEmail(value.data) : null;
}
