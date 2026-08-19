import type { RequestHandler } from 'msw';

// BE 미배포 엔드포인트만 여기에 추가한다. 배포되면 해당 핸들러를 지워 실 API로 넘긴다.
// 목에 없는 요청은 main.tsx의 onUnhandledRequest: 'bypass'로 그대로 통과.
//
// 지금은 비어 있다 — 스웨거 대조 결과 화면이 쓰는 엔드포인트가 전부 배포돼 실 API로 나간다.
// 마지막까지 남아 있던 `/api/schedules*` 목 4개도 지웠다. `api/schedule.ts`가 이제
// `/api/v1/today/schedules`를 부르므로 아무도 타지 않는 죽은 목이었다.
//
// 새로 추가할 때는 응답을 공통 봉투(`{ success, code, errorCode, message, data }`)로
// 감싸야 실 API와 형태가 같아진다.
export const handlers: RequestHandler[] = [];
