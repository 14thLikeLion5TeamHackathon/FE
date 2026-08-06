import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getMyProfile, updateNotifications } from '../../api/user';
import type { MyProfile, NotificationSettings } from '../../types/user';

/**
 * 화면에서는 이 훅만 쓴다. axios·Zod·쿼리 키를 화면이 알 필요가 없다.
 * 쿼리 키는 ['도메인', 파라미터] 형태로 통일한다.
 */
const userKeys = {
  me: ['user', 'me'] as const,
};

export function useMyProfile() {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: getMyProfile,
  });
}

export function useUpdateNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotifications,
    /** 토글은 즉시 반응해야 하므로 서버 응답을 기다리지 않고 캐시를 먼저 바꾼다. */
    onMutate: async (next: NotificationSettings) => {
      await queryClient.cancelQueries({ queryKey: userKeys.me });
      const previous = queryClient.getQueryData<MyProfile>(userKeys.me);

      if (previous) {
        queryClient.setQueryData<MyProfile>(userKeys.me, { ...previous, notifications: next });
      }

      return { previous };
    },
    /** 실패하면 되돌린다 */
    onError: (_error, _next, context) => {
      if (context?.previous) {
        queryClient.setQueryData(userKeys.me, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.me });
    },
  });
}
