import PageHeader from '../../components/PageHeader';

/**
 * 회복 탭 자리표시자.
 * TabBar에 회복 탭이 있는데 라우트가 없으면 `*`에 걸려 오늘 탭으로 튕긴다.
 * 실제 구현(카드 목록 + 회복 곡선)이 들어오면 이 파일을 갈아끼우면 된다.
 */
export default function RecoveryPage() {
  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      <PageHeader title="회복" />
      <p className="typo-body text-text-secondary">준비 중이에요.</p>
    </div>
  );
}
