import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteAccount,
  disconnectKakaoNotification,
  getMyProfile,
  patchLocation,
  postOnboarding,
  updateProfile,
} from '../../api/user';
import type { OnboardingRequest, UpdateProfileRequest } from '../../types/user';
import { notificationKeys } from '../notification/useNotification';

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

/** DELETE — 회원 탈퇴 */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccount,
  });
}

/**
 * DELETE — 카카오 알림 **연동 해제**. 수신 on/off(PATCH)와 다르다 — 연결 자체를 끊는다.
 *
 * 끊고 나면 수신 동의 캐시는 더 이상 유효하지 않다. 조회 API가 없어 다시 알아낼 방법도
 * 없으니 지워서 "모름"으로 되돌린다 — 남겨두면 없는 연동을 켜져 있다고 그린다.
 */
export function useDisconnectKakao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectKakaoNotification,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.me });
      // 조회 엔드포인트가 생겼으니 지우지 말고 다시 받는다 — 해제 후 connected:false를 확인해야 한다
      void queryClient.invalidateQueries({ queryKey: notificationKeys.kakaoStatus });
    },
  });
}

/** PATCH — 현재 위치(GPS 좌표) 서버에 저장 */
export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ latitude, longitude }: { latitude: number; longitude: number }) =>
      patchLocation(latitude, longitude),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['today'] });
    },
  });
}
