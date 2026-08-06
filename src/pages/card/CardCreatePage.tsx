import NavHeader from '../../components/NavHeader';

/**
 * 받은 케어 등록 — 자리표시자.
 * 담당: 윤서
 *
 * 시술명 검색 · 카테고리 칩 · 시술 목록(복수 선택) · 시술 날짜.
 * 하단 고정 CTA(BottomCTA)를 쓴다.
 *
 * 시안을 보고 이 파일 안을 채우면 된다. 라우트는 이미 연결돼 있다.
 */
export default function CardCreatePage() {
  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      <NavHeader title="받은 케어 등록" />
      <p className="typo-body text-text-secondary">준비 중이에요.</p>
    </div>
  );
}
