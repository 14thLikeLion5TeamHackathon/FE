import { useParams } from 'react-router';

import NavHeader from '../../components/NavHeader';

/**
 * AI 피드백 — 자리표시자.
 * 담당: 상우
 *
 * 지난 기록과 비교(사진 + 증상 4종 델타) · 분석 · 기록 강도 검토 · 오늘의 관리 · 안전 안내.
 * **결과 화면이라 저장 버튼은 콘텐츠 흐름 안에 둔다** (하단 고정 CTA 안 씀).
 *
 * 증상 델타는 색만으로 구분하지 않는다 — `↓ 좋아짐 / ↑ 나빠짐 / – 유지` 기호를 함께 쓴다.
 * 문의 권고는 AI 판단이 아니라 **룰**로 뜬다(붓기·통증 강도 3이 2일 이상 지속 등).
 *
 * 시안을 보고 이 파일 안을 채우면 된다. 라우트는 이미 연결돼 있다.
 */
export default function FeedbackPage() {
  const { recordId } = useParams();

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      <NavHeader title="AI 피드백" />
      <p className="typo-body text-text-secondary">준비 중이에요. (recordId: {recordId})</p>
    </div>
  );
}
