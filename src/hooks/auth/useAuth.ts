import { useSyncExternalStore } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postLogin, postLogout } from '../../api/auth';
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
 */
export function useAuth() {
  const token = useSyncExternalStore(subscribeAccessToken, getAccessToken);

  return {
    isLoggedIn: Boolean(token),
    login: setAccessToken,
    logout: clearAccessToken,
  };
}

/** 로그인 — 받은 토큰을 저장까지 한다. 저장되는 순간 가드가 열린다. */
export function useLogin() {
  return useMutation({
    mutationFn: postLogin,
    onSuccess: ({ accessToken }) => setAccessToken(accessToken),
  });
}

/** 로그아웃 — 서버 호출이 실패해도 로컬 토큰은 반드시 지운다. */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postLogout,
    onSettled: () => {
      clearAccessToken();
      // 이전 사용자의 응답이 다음 로그인에 섞이지 않도록 캐시를 비운다.
      queryClient.clear();
    },
  });
}
