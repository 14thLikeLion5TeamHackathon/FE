import Card from '../../../components/Card';
import { cn } from '../../../lib/cn';

export type GuideStage = {
  range: string;
  description: string;
  current?: boolean;
};

export type RecoveryGuideProps = {
  stages: GuideStage[];
  className?: string;
};

export default function RecoveryGuide({
  stages,
  className,
}: RecoveryGuideProps) {
  return (
    <Card
      className={cn(
        'flex w-full flex-col items-start gap-[10px] rounded-card border border-border-subtle bg-surface-raised p-4',
        className,
      )}
    >
      <h3 className="typo-section text-text-primary">회복 가이드</h3>

      <div className="flex w-full flex-col gap-1">
        {stages.map((stage, index) => (
          <div
            key={index}
            className={cn(
              'flex w-full items-center gap-[10px] rounded-[6px] px-[10px] py-[8px] transition-colors',
              // 🎯 current 시 확실히 눈에 띄는 투명도 들어간 하이라이트 배경(bg-primary/10 또는 bg-white/5) 적용
              stage.current
                ? 'bg-primary/10 border border-primary/20'
                : 'bg-transparent',
            )}
          >
            <span
              className={cn(
                'w-[58px] shrink-0 typo-caption',
                stage.current
                  ? 'font-bold text-primary'
                  : 'text-text-tertiary',
              )}
            >
              {stage.range}
            </span>

            <p
              className={cn(
                'flex-1 typo-body',
                stage.current
                  ? 'font-semibold text-text-primary'
                  : 'text-text-secondary',
              )}
            >
              {stage.description}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}