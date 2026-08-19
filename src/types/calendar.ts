import { z } from 'zod';

/**
 * 구글 캘린더 연동 상태.
 *
 * 스웨거가 응답을 `object`라고만 적어둬서 형태가 확정돼 있지 않다. 미연동일 때는
 * `data: null`이 온다(2026-08-18 실서버 확인). 연동된 응답은 아직 못 봤다 —
 * 스웨거 설명에 "CONNECTED/DISCONNECTED/null"이라 적혀 있어 문자열이거나
 * 그 값을 담은 객체로 추정한다.
 *
 * 게다가 **공통 봉투가 붙는지도 확정이 아니다(미확인)** — 스펙은 봉투 없는 맵으로 적혀
 * 있는데(`environment/weather`와 같은 예외) 실서버에서 본 `data: null`은 봉투 쪽이다.
 * 그래서 API 함수는 봉투를 벗기지 않고 본문을 통째로 넘기고, 판별은 여기서 한다.
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
