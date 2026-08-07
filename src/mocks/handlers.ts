import { http, HttpResponse } from 'msw';

import * as db from './data';

// BE 미배포 엔드포인트만 여기에 추가한다. 배포되면 해당 핸들러를 지워 실 API로 넘긴다.
// 목에 없는 요청은 main.tsx의 onUnhandledRequest: 'bypass'로 그대로 통과.

/** 공통 응답 봉투로 감싸는 헬퍼. 모든 목이 이 형태를 지켜야 실 API와 같아진다. */
function ok<T>(result: T) {
  return HttpResponse.json({ isSuccess: true, code: 'COMMON200', message: 'ok', result });
}

function notFound(message: string) {
  return HttpResponse.json(
    { isSuccess: false, code: 'COMMON404', message, result: null },
    { status: 404 },
  );
}

export const handlers = [
  http.get('/api/health', () => ok(null)),

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
  http.post('/api/cards', () => ok(db.cards[0])),

  http.get('/api/treatments', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const q = url.searchParams.get('q');
    let list = db.treatments;
    if (category) list = list.filter((t) => t.category === category);
    if (q) list = list.filter((t) => t.name.includes(q));
    return ok(list);
  }),

  /* ── 기록 ─────────────────────────────────────────────── */
  http.get('/api/cards/:cardId/records', ({ params }) =>
    ok(db.records.filter((r) => r.cardId === params.cardId)),
  ),
  http.post('/api/records', () => ok({ recordId: 'rec-2' })),

  /* ── AI 피드백 ────────────────────────────────────────── */
  http.get('/api/records/:recordId/feedback', ({ params }) =>
    // 시안의 두 케이스를 나란히 확인하려고 recordId로 분기한다
    ok(params.recordId === 'warn' ? db.feedbackWarning : db.feedback),
  ),

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
