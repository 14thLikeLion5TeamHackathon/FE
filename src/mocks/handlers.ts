import { http, HttpResponse } from 'msw';

import * as db from './data';

// BE 미배포 엔드포인트만 여기에 추가한다. 배포되면 해당 핸들러를 지워 실 API로 넘긴다.
// 목에 없는 요청은 main.tsx의 onUnhandledRequest: 'bypass'로 그대로 통과.

/** 공통 응답 봉투로 감싸는 헬퍼. 모든 목이 이 형태를 지켜야 실 API와 같아진다. */
function ok<T>(data: T) {
  return HttpResponse.json({ success: true, code: 200, errorCode: null, message: 'ok', data });
}

function notFound(message: string) {
  return HttpResponse.json(
    { success: false, code: 404, errorCode: 'COMMON404', message, data: null },
    { status: 404 },
  );
}

/*
 * 401 리다이렉트를 눈으로 확인하려면 아무 핸들러나 잠깐 이걸로 바꿔본다.
 *   http.get('/api/today', () =>
 *     HttpResponse.json({ success: false, code: 401, errorCode: 'COMMON401', message: '만료',
 *       data: null }, { status: 401 })),
 */

export const handlers = [
  http.get('/api/health', () => ok(null)),

  /* ── 인증 ─────────────────────────────────────────────── */
  // 로그인 목은 지웠다 — 계약에 로그인 엔드포인트가 없다(소셜 리다이렉트 방식).
  // 로그아웃은 BE에 배포돼 있으므로(POST /api/v1/mypage/auth/logout) 목을 두지 않는다.

  /* ── 마이 ─────────────────────────────────────────────── */
  http.get('/api/users/me', () => ok(db.myProfile)),
  http.patch('/api/users/me/notifications', async ({ request }) => {
    const next = (await request.json()) as typeof db.myProfile.notifications;
    db.myProfile.notifications = next;
    return ok(next);
  }),

  /* ── 오늘 ─────────────────────────────────────────────── */
  http.get('/api/today', () => ok(db.today)),
  http.patch('/api/today/checklist/:itemId', async ({ params, request }) => {
    const { done } = (await request.json()) as { done: boolean };
    const item = db.today.checklist.find((c) => c.id === params.itemId);
    if (item) item.done = done;
    return ok(null);
  }),

  /* ── 카드 ─────────────────────────────────────────────── */
  http.get('/api/cards', () => ok(db.cards)),
  http.get('/api/cards/:cardId', ({ params }) => {
    const card = db.cards.find((c) => c.id === params.cardId);
    if (!card) return notFound('없는 카드예요');
    return ok({ ...db.cardDetail, ...card });
  }),
  // POST /api/v1/create/care-cards, GET /api/v1/create/treatments는 BE 배포 완료로 목 제거 (#42)

  /* ── 기록 ─────────────────────────────────────────────── */
  http.get('/api/cards/:cardId/records', ({ params }) =>
    ok(db.records.filter((r) => r.cardId === params.cardId)),
  ),
  http.post('/api/records', () => ok({ recordId: 'rec-2' })),

  // GET /api/v1/now/records/:recordId/feedback은 BE 배포 완료로 목 제거 (#42)

  /* ── 회복 ─────────────────────────────────────────────── */
  http.get('/api/recovery', () => ok(db.recovery)),

  /* ── 일정 ─────────────────────────────────────────────── */
  http.get('/api/schedules/:scheduleId', ({ params }) => {
    const found = db.schedules.find((s) => s.id === params.scheduleId);
    if (!found) return notFound('없는 일정이에요');
    return ok(found);
  }),
  http.post('/api/schedules', () => ok(db.schedules[0])),
  http.put('/api/schedules/:scheduleId', () => ok(db.schedules[0])),
  http.delete('/api/schedules/:scheduleId', () => ok(null)),
];
