import { useSyncExternalStore } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { logout } from '../../api/user';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  subscribeAccessToken,
} from '../../api/token';

/**
 * 로그인 상태를 읽는 훅.
 *
 * 토큰의 원본은 localStorage 하나뿐이고, 이 훅은 그걸 구독해서 읽기만 한다.
 * Context나 useState로 사본을 두면 화면마다 상태가 어긋날 수 있어서
 * 외부 저장소 구독용 API인 useSyncExternalStore를 쓴다. (#25 참고)
 *
 * 로그아웃은 여기서 노출하지 않는다 — 토큰만 지우면 이전 사용자의 쿼리 캐시가 남는다.
 * 로그아웃 경로는 캐시까지 비우는 `useLogout` 하나로 유지한다.
 */
export function useAuth() {
  const token = useSyncExternalStore(subscribeAccessToken, getAccessToken);

  return {
    isLoggedIn: Boolean(token),
    login: setAccessToken,
  };
}

/** 로그아웃 — 서버 호출이 실패해도 로컬 토큰은 반드시 지운다. */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAccessToken();
      // 이전 사용자의 응답이 다음 로그인에 섞이지 않도록 캐시를 비운다.
      queryClient.clear();
    },
  });
}
