import BottomSheet from '../../../components/BottomSheet';
import type { Term } from '../../../lib/terms';

type TermsSheetProps = {
  /** null이면 닫힌 상태. 열릴 때 어떤 약관인지까지 같이 들어온다. */
  term: Term | null;
  onClose: () => void;
};

/**
 * 약관 전문 시트.
 *
 * 전문이 길어 시트가 화면을 넘긴다. 높이를 화면의 80%로 묶고 본문만 스크롤시킨다 —
 * 시트째 늘리면 손잡이와 닫기 버튼이 화면 밖으로 밀려 닫을 방법이 사라진다.
 */
export default function TermsSheet({ term, onClose }: TermsSheetProps) {
  return (
    <BottomSheet open={term !== null} onClose={onClose} label={term?.title ?? '약관'}>
      {term && (
        <div className="flex max-h-[80vh] flex-col">
          <div className="flex items-center gap-1.5 pb-3">
            <h2 className="typo-card-title text-text-primary">{term.title}</h2>
            <span className="typo-caption text-text-tertiary">
              {term.required ? '필수' : '선택'}
            </span>
            {term.badge && (
              <span className="typo-caption text-primary border-primary rounded-full border px-1.5">
                {term.badge}
              </span>
            )}
          </div>

          <dl className="flex flex-col gap-3.5 overflow-y-auto pb-2">
            {term.sections.map((section) => (
              <div key={section.label}>
                <dt className="typo-label text-text-primary">{section.label}</dt>
                {/* 조문이라 줄바꿈 없이 한 문단으로 붙는다. 자간이 좁으면 읽기 힘들어 leading을 넓게 준다 */}
                <dd className="typo-caption text-text-secondary mt-0.5 leading-relaxed">
                  {section.body}
                </dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            onClick={onClose}
            className="bg-surface-raised text-text-primary typo-label rounded-btn mt-4 w-full shrink-0 py-3"
          >
            확인
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
