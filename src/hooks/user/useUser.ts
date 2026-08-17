import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteAccount,
  disconnectKakaoNotification,
  getMyProfile,
  logout,
  postOnboarding,
  updateProfile,
} from '../../api/user';
import type { OnboardingRequest, UpdateProfileRequest } from '../../types/user';

const userKeys = {
  me: ['user', 'me'] as const,
};

/**
 * POST — 온보딩(회원정보 등록).
 *
 * 성공하면 프로필 캐시를 버린다. 온보딩 직후 마이 탭에 들어가면
 * 등록 전에 받아둔 빈 프로필이 남아 있어 방금 넣은 이름이 안 보인다.
 */
export function useOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: OnboardingRequest) => postOnboarding(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.me });
    },
  });
}

/** GET — 개인정보 조회 */
export function useMyProfile() {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: getMyProfile,
  });
}

/** PUT — 개인정보 수정 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => updateProfile(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.me });
    },
  });
}

/** POST — 로그아웃 */
export function useLogout() {
  return useMutation({
    mutationFn: logout,
  });
}

/** DELETE — 회원 탈퇴 */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccount,
  });
}

/** DELETE — 카카오 알림 연동 해제 */
export function useDisconnectKakao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectKakaoNotification,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.me });
    },
  });
}
