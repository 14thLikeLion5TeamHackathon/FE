import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { updateKakaoConsent } from '../../api/notification';

/** 다른 도메인(연동 해제)에서도 이 캐시를 비워야 해서 내보낸다 */
export const notificationKeys = {
  kakaoConsent: ['notification', 'kakao', 'consent'] as const,
};

/**
 * 카카오톡 알림 수신 동의 여부.
 *
 * **조회 엔드포인트가 없다.** 스펙에 있는 건 POST(연동)와 PATCH(수신 on/off)뿐이라,
 * 첫 진입에는 서버 상태를 알 방법 자체가 없다. 그래서 `skipToken`으로 요청을 아예
 * 보내지 않는 쿼리를 두고, PATCH 응답이 오면 그 값을 캐시에 심어 화면 상태로 쓴다.
 *
 * 즉 반환값 `undefined`는 "꺼짐"이 아니라 **"모름"**이다. 호출부는 이 셋을 구분해야 한다.
 * 모름을 꺼짐으로 뭉개면 연동해 둔 사용자에게 "연동 안 됨"이라고 거짓말하게 된다.
 *
 * 버린 대안: 진입할 때 PATCH를 한 번 던져 현재 값을 알아내는 것. PATCH는 조회가 아니라
 * 변경이라 무엇을 보내든 사용자의 설정을 덮어쓴다 — 상태를 알려고 상태를 바꾸는 꼴이다.
 */
export function useKakaoConsent() {
  return useQuery<boolean>({
    queryKey: notificationKeys.kakaoConsent,
    queryFn: skipToken,
    staleTime: Infinity,
  });
}

/**
 * 수신 on/off 전환.
 *
 * 응답의 `consent`가 비어 올 수 있어(스웨거에 required가 없다) 그때는 우리가 보낸 값을
 * 그대로 믿는다 — 200이 온 이상 서버에는 반영된 것이다.
 */
export function useUpdateKakaoConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (consent: boolean) => updateKakaoConsent(consent),
    onSuccess: (data, consent) => {
      queryClient.setQueryData(notificationKeys.kakaoConsent, data.consent ?? consent);
    },
  });
}
