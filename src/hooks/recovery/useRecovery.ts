import { useQuery } from '@tanstack/react-query';

import { getRecovery } from '../../api/recovery';

/** 회복 탭 — 카드 목록(진행 중/완료) + 회복 곡선 */
export function useRecovery() {
  return useQuery({ queryKey: ['recovery'], queryFn: getRecovery });
}
