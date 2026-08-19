import Card from '../../../components/Card';
import Checkbox from '../../../components/Checkbox';
import { cn } from '../../../lib/cn';

type AgreementItemProps = {
  title: string;
  description?: string;
  required?: boolean;
  /** 민감정보·국외이전 같은 법적 성격 표시. 없으면 배지를 안 그린다. */
  badge?: string;
  checked: boolean;
  onToggle: () => void;
  /** 전문 보기. 시트를 여는 건 부모 몫이라 여기서는 알리기만 한다. */
  onView: () => void;
};

/** 약관 동의 카드 한 장 — 필수/선택 마커 + 체크박스 + 제목 + 보기 링크 + 설명. */
export default function AgreementItem({
  title,
  description,
  required = false,
  badge,
  checked,
  onToggle,
  onView,
}: AgreementItemProps) {
  return (
    <Card
      variant="block"
      className={cn('border', checked ? 'border-primary border-[1.5px]' : 'border-transparent')}
    >
      <div className="flex items-center gap-2.5">
        <Checkbox checked={checked} onChange={onToggle} aria-label={title} />
        <span className="typo-body flex-1">
          <span className="text-text-tertiary">{required ? '필수' : '선택'}</span>{' '}
          <span className="text-text-primary">{title}</span>{' '}
          {badge && (
            <span className="typo-caption text-primary border-primary rounded-full border px-1.5">
              {badge}
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={onView}
          // 제목이 옆에 있어도 스크린리더는 버튼만 따로 읽는다 — "보기"만으로는 뭘 여는지 알 수 없다
          aria-label={`${title} 전문 보기`}
          className="typo-caption text-text-tertiary shrink-0 underline"
        >
          보기
        </button>
      </div>
      {description && <p className="typo-caption text-text-secondary mt-1 ml-8">{description}</p>}
    </Card>
  );
}
