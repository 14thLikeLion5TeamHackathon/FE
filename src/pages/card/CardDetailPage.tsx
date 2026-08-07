import { useParams } from 'react-router';

import NavHeader from '../../components/NavHeader';

/**
 * 카드 상세 — 자리표시자.
 * 담당: 서연
 *
 * 케어 정보 · 오늘의 관리 · 회복 가이드 · 주의사항 · 회복 기록 타임라인.
 * **결과·조회 화면이라 버튼은 콘텐츠 흐름 안에 둔다** (하단 고정 CTA 안 씀).
 *
 * 시안을 보고 이 파일 안을 채우면 된다. 라우트는 이미 연결돼 있다.
 */
export default function CardDetailPage() {
  const { cardId } = useParams();

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      <NavHeader title="카드 상세" />
      <p className="typo-body text-text-secondary">준비 중이에요. (cardId: {cardId})</p>
    </div>
  );
}
