import Card from '../../../components/Card';
import Checkbox from '../../../components/Checkbox';
import { cn } from '../../../lib/cn';

type AgreementItemProps = {
  title: string;
  description?: string;
  required?: boolean;
  checked: boolean;
  onToggle: () => void;
};

/** 약관 동의 카드 한 장 — 필수/선택 마커 + 체크박스 + 제목 + (미연동) 보기 링크 + 설명. */
export default function AgreementItem({
  title,
  description,
  required = false,
  checked,
  onToggle,
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
          <span className="text-text-primary">{title}</span>
        </span>
        {/* 약관 본문 화면이 아직 없어 disabled 처리 — 연동되면 BottomSheet 등으로 열기 */}
        <button type="button" disabled className="typo-caption text-text-tertiary underline">
          보기
        </button>
      </div>
      {description && <p className="typo-caption text-text-secondary mt-1 ml-8">{description}</p>}
    </Card>
  );
}
