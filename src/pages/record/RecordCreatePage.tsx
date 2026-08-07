import NavHeader from '../../components/NavHeader';

/**
 * 상태 기록 — 자리표시자.
 * 담당: 서연
 *
 * 대상 카드 · 사진 · 지금 상태 · 증상 칩 4종 · 증상 정도 세그먼트(없음·약간·보통·심함).
 * 하단 고정 CTA(BottomCTA)를 쓴다.
 *
 * ⚠️ 사진 업로드 방식(presigned URL / multipart)이 BE와 아직 안 정해졌다.
 *    정해지기 전까지는 로컬 미리보기까지만 만들어두면 된다.
 *
 * 시안을 보고 이 파일 안을 채우면 된다. 라우트는 이미 연결돼 있다.
 */
export default function RecordCreatePage() {
  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      <NavHeader title="상태 기록" />
      <p className="typo-body text-text-secondary">준비 중이에요.</p>
    </div>
  );
}
