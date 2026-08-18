import { useQuery } from '@tanstack/react-query';

import { getFeedback } from '../../api/feedback';

export function useFeedback(recordId: string) {
  return useQuery({
    queryKey: ['feedback', recordId],
    queryFn: () => getFeedback(recordId),
    enabled: Boolean(recordId),
  });
}
