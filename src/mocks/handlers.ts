import { http, HttpResponse } from 'msw';

// BE 미배포 엔드포인트만 여기에 추가한다. 배포되면 핸들러를 지워 실 API로 넘긴다.
// 목에 없는 요청은 main.tsx의 onUnhandledRequest: 'bypass'로 그대로 통과.

/** 공통 응답 봉투로 감싸는 헬퍼. 모든 목이 이 형태를 지켜야 실 API와 같아진다. */
function ok<T>(result: T) {
  return HttpResponse.json({ isSuccess: true, code: 'COMMON200', message: 'ok', result });
}

const myProfile = {
  name: '최서연',
  birthDate: '2007.05.17',
  gender: 'FEMALE',
  calendarEmail: 'kimsu3047@gmail.com',
  notifications: {
    all: true,
    dailyCare: true,
    recordReminder: true,
    preWarning: true,
  },
};

export const handlers = [
  http.get('/api/health', () => ok(null)),

  http.get('/api/users/me', () => ok(myProfile)),

  http.patch('/api/users/me/notifications', async ({ request }) => {
    const next = (await request.json()) as typeof myProfile.notifications;
    myProfile.notifications = next;
    return ok(next);
  }),
];
