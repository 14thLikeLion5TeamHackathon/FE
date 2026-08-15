import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteAccount,
  disconnectKakaoNotification,
  getMyProfile,
  logout,
  updateProfile,
} from '../../api/user';
import type { UpdateProfileRequest } from '../../types/user';

const userKeys = {
  me: ['user', 'me'] as const,
};

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
