import { useState } from 'react';

import { cn } from '../../../lib/cn';
import { mediaUrl } from '../../../lib/mediaUrl';
import type {
  RecoveryCardOption,
  RecoveryCurve as RecoveryCurveData,
} from '../../../types/recovery';
import SymptomChart from './SymptomChart';

type RecoveryCurveProps = {
  curve: RecoveryCurveData;
  /** 진행 중 카드가 2장 이상일 때만 채워 보낸다. 비어 있으면 카드 선택 줄을 그리지 않는다. */
  cardOptions: RecoveryCardOption[];
  onSelectCard: (cardId: number) => void;
  onRecord: () => void;
};

/** 사진이 없는 기록이 섞이므로 자리는 항상 잡아 두고 있을 때만 채운다 — 있고 없고에 따라 높이가 튀지 않게. */
function PhotoFrame({
  url,
  alt,
  className,
}: {
  url: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <div className={cn('bg-surface-fill border-border-subtle overflow-hidden border', className)}>
      {/*
        서버가 준 경로를 그대로 쓰면 안 된다. `/uploads/<uuid>.png`처럼 상대경로로 오는데,
        브라우저는 그걸 지금 보고 있는 도메인에 붙인다 — 배포본에서는 프론트 도메인으로
        요청이 나가고 Vercel이 SPA 폴백 HTML을 200으로 돌려줘서 사진이 전부 깨진다.
        404가 아니라 200이라 원인이 잘 안 보인다(lib/mediaUrl.ts 주석).
      */}
      {url && (
        <img src={mediaUrl(url)} alt={alt} className="size-full object-cover" loading="lazy" />
      )}
    </div>
  );
}

/** 카드 선택 줄 — 카드가 여럿일 때 곡선의 기본 선택(가장 최근 진행 중 시술)을 사용자가 덮는다. */
function CardPicker({
  options,
  selectedId,
  onSelect,
}: {
  options: RecoveryCardOption[];
  selectedId: number;
  onSelect: (cardId: number) => void;
}) {
  return (
    <ul className="no-scrollbar flex gap-1.5 overflow-x-auto" aria-label="곡선을 볼 카드">
      {options.map((option) => {
        const active = option.cardId === selectedId;
        return (
          <li key={option.cardId}>
            <button
              type="button"
              onClick={() => onSelect(option.cardId)}
              aria-pressed={active}
              className={cn(
                'typo-caption rounded-chip border px-2.5 py-1 whitespace-nowrap',
                active ? 'border-primary text-primary' : 'border-border-subtle text-text-secondary',
              )}
            >
              {option.treatmentName}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * 회복 곡선.
 *
 * 사진이 실감을, 곡선이 추세를 담당한다.
 * 사진 칸을 3개로 고정하지 않는다 — 회복 기간이 29일이라 기록이 5~6개 쌓이기 때문이다.
 * 대신 **두 시점을 골라 비교**하고, 전체 기록은 타임라인으로 훑는다.
 */
export default function RecoveryCurve({
  curve,
  cardOptions,
  onSelectCard,
  onRecord,
}: RecoveryCurveProps) {
  const { points } = curve;

  /**
   * 비교 중인 두 시점. **고른 순서대로 담는다** — 앞이 먼저 고른 쪽이다.
   *
   * 화면에 그릴 때는 아래에서 시간순으로 다시 세우므로 이 순서는 눈에 보이지 않는다.
   * 순서를 들고 있는 이유는 하나뿐이다: 세 번째를 고를 때 **먼저 고른 것을 뺀다.**
   * 그래야 방금 고른 사진은 남고, 무엇이 빠질지도 예측할 수 있다.
   *
   * 비교 시점을 서버가 정해 주지 않는다(그런 응답이 애초에 없다).
   * 처음↔마지막이 기본값인 이유는 그게 "얼마나 좋아졌나"에 가장 곧바로 답하기 때문이다.
   */
  const [selection, setSelection] = useState<[number, number]>([0, Math.max(0, points.length - 1)]);

  /**
   * 기록을 저장하거나 카드를 바꾸면 points가 통째로 갈린다. useState는 첫 렌더 값만 쓰므로
   * 그대로 두면 이전 카드의 인덱스가 남아 엉뚱한 시점을 가리키거나 범위를 벗어난다.
   */
  const [knownCurve, setKnownCurve] = useState(`${curve.cardId}:${points.length}`);
  if (knownCurve !== `${curve.cardId}:${points.length}`) {
    setKnownCurve(`${curve.cardId}:${points.length}`);
    setSelection([0, Math.max(0, points.length - 1)]);
  }

  const showPicker = cardOptions.length > 1;

  // 기록이 1개 이하면 추세가 성립하지 않는다. 곡선 대신 기록을 유도한다.
  if (points.length <= 1) {
    return (
      <section className="bg-surface-raised rounded-md flex flex-col items-center gap-2 p-4">
        <h2 className="typo-section self-start">회복 곡선</h2>
        {showPicker && (
          <div className="w-full">
            <CardPicker options={cardOptions} selectedId={curve.cardId} onSelect={onSelectCard} />
          </div>
        )}
        <p className="typo-body text-text-primary mt-2">
          {points.length === 0 ? '아직 기록이 없어요' : '기록이 하나뿐이에요'}
        </p>
        <p className="typo-caption text-text-tertiary">
          {curve.treatmentName} 기록을 2개 이상 남기면 회복 흐름을 볼 수 있어요
        </p>
        <button
          type="button"
          onClick={onRecord}
          className="bg-primary text-primary-on typo-label rounded-btn mt-2 px-4 py-2"
        >
          지금 기록하기
        </button>
      </section>
    );
  }

  /**
   * 타임라인에서 고른다. **선택은 항상 둘이다.**
   *
   * 셋째를 고르면 먼저 고른 것이 빠지고 방금 고른 것이 들어온다. 이미 고른 것을 다시 누르면
   * 그대로 둔다 — 하나만 남기면 비교가 성립하지 않아서, 뺄 수 있게 만들면 화면이 무너진다.
   */
  const toggle = (index: number) => {
    setSelection(([older, newer]) =>
      index === older || index === newer ? [older, newer] : [newer, index],
    );
  };

  /**
   * 그릴 때는 시간순으로 세운다. 고른 순서를 그대로 쓰면 왼쪽이 D+14, 오른쪽이 D+3처럼
   * 거꾸로 놓여, 사이의 화살표가 실제와 반대를 가리킨다.
   */
  const [start, end] = selection[0] <= selection[1] ? selection : [selection[1], selection[0]];

  return (
    <section className="bg-surface-raised rounded-md flex flex-col gap-3 p-4">
      <header className="flex items-center justify-between">
        <h2 className="typo-section">회복 곡선</h2>
        <span className="typo-caption text-text-tertiary">기록 {points.length}개</span>
      </header>

      {showPicker ? (
        <CardPicker options={cardOptions} selectedId={curve.cardId} onSelect={onSelectCard} />
      ) : (
        <p className="typo-caption text-text-secondary">{curve.treatmentName}</p>
      )}

      {/* 두 시점 사진 비교 — 라벨은 아래 캡션이 담당한다 */}
      <div className="flex gap-2">
        {[start, end].map((index) => {
          const point = points[index];
          return (
            <figure key={point.recordId} className="flex flex-1 flex-col gap-1.5">
              <PhotoFrame
                url={point.photoUrl}
                alt={`${point.ddayLabel} 기록 사진`}
                className="rounded-md aspect-[161/172] w-full"
              />
              <figcaption className="flex items-center gap-1.5">
                <span className="typo-label text-text-primary">{point.ddayLabel}</span>
                <span className="typo-caption text-text-tertiary">{point.dateLabel}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>

      <div className="bg-border-subtle h-px w-full" aria-hidden />

      {/* 전체 기록 타임라인 — 항목이 폭을 넘으면 가로 스크롤 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <p className="typo-label text-text-secondary">전체 기록</p>
          {/* 누를 수 있다는 걸 어디에서도 알려주지 않았다. 선택지가 둘뿐이면 고를 게 없어 감춘다 */}
          {points.length > 2 && (
            <p className="typo-caption text-text-tertiary">눌러서 비교할 시점을 바꿔요</p>
          )}
        </div>
        <ul className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {points.map((point, index) => {
            const active = index === start || index === end;
            return (
              <li key={point.recordId}>
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-pressed={active}
                  aria-label={`${point.ddayLabel} ${point.dateLabel} 기록, 비교에 ${active ? '선택됨' : '넣기'}`}
                  className="flex flex-col items-center gap-1"
                >
                  <PhotoFrame
                    url={point.photoUrl}
                    alt=""
                    className={cn(
                      'rounded-sm size-11',
                      active ? 'border-primary border-[1.5px]' : 'border-border-subtle',
                    )}
                  />
                  <span
                    className={cn('typo-caption', active ? 'text-primary' : 'text-text-tertiary')}
                  >
                    {point.ddayLabel}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="bg-border-subtle h-px w-full" aria-hidden />

      <div className="flex flex-col gap-2">
        <p className="typo-label text-text-secondary">증상 변화</p>
        <SymptomChart points={points} />
      </div>
    </section>
  );
}
