import PageHeader from '../../components/PageHeader';

/**
 * 오늘 탭 — 자리표시자.
 * 담당: 상우
 *
 * 캘린더(주/월 전환) → 케어 브리핑 → 오늘의 케어 체크리스트 → 근거 블록 순서.
 * 왜 → 무엇 → 근거 흐름이고, 매일 여는 이유인 체크리스트가 첫 화면에 들어와야 한다.
 * 캘린더 헤더 우측 `+ 일정`이 일정 입력(`/schedules/new`) 진입점이다.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      <PageHeader title="오늘" />
      <p className="typo-body text-text-secondary">준비 중이에요.</p>
    </div>
  );
}
