import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getKakaoStatus, updateKakaoConsent } from '../../api/notification';

/** 다른 도메인(연동 해제)에서도 이 캐시를 건드려야 해서 내보낸다 */
export const notificationKeys = {
  kakaoStatus: ['notification', 'kakao', 'status'] as const,
};

/**
 * 카카오톡 알림 연동·수신 상태.
 *
 * `connected`와 `consent`는 다른 값이다 — 연동은 살아 있는데 수신만 꺼둔 상태가 있다.
 * 미연동이면 서버가 200에 `connected: false`만 담아 주고 `consent`는 비워 보낸다.
 *
 * 데이터가 아직 `undefined`인 동안은 "꺼짐"이 아니라 **"모름"**이다. 호출부는 셋을
 * 구분해야 한다 — 모름을 꺼짐으로 뭉개면 연동해 둔 사용자에게 "연동 안 됨"이라고 거짓말한다.
 */
export function useKakaoStatus() {
  return useQuery({
    queryKey: notificationKeys.kakaoStatus,
    queryFn: getKakaoStatus,
  });
}

/**
 * 수신 on/off 전환.
 *
 * 응답의 `consent`가 비어 올 수 있어(스웨거에 required가 없다) 그때는 우리가 보낸 값을
 * 그대로 믿는다 — 200이 온 이상 서버에는 반영된 것이다.
 * PATCH 응답에는 `connected`가 없으므로 직전 캐시 위에 덮어쓴다.
 */
export function useUpdateKakaoConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (consent: boolean) => updateKakaoConsent(consent),
    onSuccess: (data, consent) => {
      queryClient.setQueryData(notificationKeys.kakaoStatus, {
        ...data,
        consent: data.consent ?? consent,
        // 수신 동의를 바꿀 수 있었다는 건 연동이 살아 있다는 뜻이다
        connected: true,
      });
    },
  });
}
