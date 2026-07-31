import { http, HttpResponse } from 'msw';

// BE 미배포 엔드포인트만 여기에 추가한다. 배포되면 핸들러를 지워 실 API로 넘긴다.
// 목에 없는 요청은 main.tsx의 onUnhandledRequest: 'bypass'로 그대로 통과.
export const handlers = [
  http.get('/api/health', () =>
    HttpResponse.json({ isSuccess: true, code: 'COMMON200', message: 'ok', result: null }),
  ),
];
