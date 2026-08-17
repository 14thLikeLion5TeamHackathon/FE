export const handlers = [
  /* ── 인증 · 마이 · 오늘 · 카드 · 기록 ─────────────────────
   *
   * 목을 전부 지웠다. 스웨거 대조 결과 모두 배포돼 있어 실 API로 나간다.
   *
   * 남아 있는 동안 실제로 가려지던 것들:
   * - 오늘 탭이 `/api/v1/cards`로 가짜 카드 3개를 받아, "카드 없음" 빈 화면을 볼 수 없었다.
   * - 회복 탭과 기록 등록은 통째로 가짜라 실서버 검증이 불가능했다. */

  /* ── 일정 ─────────────────────────────────────────────── */
  // ⚠️ 이 경로는 서버에 없다. 실제는 `/api/v1/today/schedules`(POST)와
  //    `/{scheduleId}`(PUT·DELETE)인데 FE가 아직 옛 경로를 부르고 있어, 이 목이 그걸
  //    가려주는 중이다. 화면 수정과 함께 경로를 고치면 이 목도 지운다.
  http.get('/api/schedules/:scheduleId', ({ params }) => {
    const found = db.schedules.find((s) => s.id === params.scheduleId);
    if (!found) return notFound('없는 일정이에요');
    return ok(found);
  }),
  // POST/PUT/DELETE /api/v1/today/schedules는 BE 배포 완료로 목 제거 (#42)
];