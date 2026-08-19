import Card from '../../../components/Card';
import Chip from '../../../components/Chip';
import { cn } from '../../../lib/cn';
import { mediaUrl } from '../../../lib/mediaUrl';

export type RecordCardProps = {
  /** 날짜 및 케어명 (예: "08.01 · 포텐자") */
  title: string;
  /** D-day 표시 텍스트 (예: "D+7") */
  dday: string;
  /** 등록된 사진 URL 리스트 */
  photoUrls?: string[];
  /** 메모 / 상태 본문 텍스트 */
  memo: string;
  /** 선택된 증상 태그 리스트 (예: ["붉은기", "부기"]) */
  tags?: string[];
  /** AI 피드백 텍스트 (선택 사항) */
  aiFeedback?: string;
  /**
   * 전체 피드백 보기. **피드백이 이미 있는 기록에만 넘긴다** —
   * 조회가 404면 생성으로 넘어가는데(api/feedback.ts) 생성은 하루 3회 제한이라,
   * 아무 기록에나 달면 눌렀을 뿐인데 횟수를 쓴다.
   */
  onViewFeedback?: () => void;
  className?: string;
};

/**
 * 시안 `RecordCard` (Figma `RecordCard` > Head / Photos / Memo / Tags / AIFeedback).
 *
 * 상태 기록 타임라인에 들어가는 표시 전용 순수 컴포넌트입니다.
 * 입력된 Props 데이터만 기반으로 UI를 그립니다.
 */
export default function RecordCard({
  title,
  dday,
  photoUrls = [],
  memo,
  tags = [],
  aiFeedback,
  onViewFeedback,
  className,
}: RecordCardProps) {
  return (
    <Card
      className={cn(
        // 공통 — 패딩 16, 내부 간격 10, 배경은 surface-raised
        'flex w-full flex-col items-start gap-[10px] bg-surface-raised p-4 rounded-card',
        className,
      )}
    >
      {/* 1. Head */}
      <div className="flex w-full items-center gap-2">
        <span className="flex-1 typo-label text-text-secondary">{title}</span>
        <Chip variant="outline" className="text-text-tertiary border-border-subtle font-medium">
          {dday}
        </Chip>
      </div>

      {/* 2. Photos */}
      {photoUrls.length > 0 && (
        <div className="flex w-full items-start gap-2 overflow-x-auto pb-1 scrollbar-none">
          {photoUrls.map((url, index) => (
            <img
              key={`${url}-${index}`}
              src={mediaUrl(url)}
              alt={`기록 사진 ${index + 1}`}
              className="bg-surface-elevated size-[72px] shrink-0 rounded-btn object-cover"
            />
          ))}
        </div>
      )}

      {/* 3. Memo */}
      <p className="w-full typo-body text-text-primary whitespace-pre-wrap">{memo}</p>

      {/* 4. Tags */}
      {tags.length > 0 && (
        <div className="flex w-full items-start gap-1.5 flex-wrap">
          {tags.map((tag) => (
            <Chip key={tag} variant="fill" className="text-text-secondary bg-surface-fill">
              {tag}
            </Chip>
          ))}
        </div>
      )}

      {/* 5. AIFeedback */}
      {aiFeedback && (
        <div className="flex w-full flex-col items-start gap-1 rounded-btn bg-surface-elevated p-3">
          <div className="flex w-full items-center justify-between">
            <span className="typo-caption text-text-tertiary">AI 피드백</span>
            {onViewFeedback && (
              <button type="button" onClick={onViewFeedback} className="typo-caption text-primary">
                자세히 보기
              </button>
            )}
          </div>
          <p className="w-full typo-body text-text-secondary">{aiFeedback}</p>
        </div>
      )}
    </Card>
  );
}
