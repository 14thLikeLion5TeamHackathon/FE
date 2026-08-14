import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import BottomCTA from '../../components/BottomCTA';
import NavHeader from '../../components/NavHeader';

import { useCardDetail } from '../../hooks/card/useCard';
import { useCreateRecord } from '../../hooks/record/useRecord';
import { cn } from '../../lib/cn';
import type { Intensity, SymptomKey } from '../../types/common';

import IntensitySelectBlock from './components/IntensitySelectBlock';
import PhotoUploadBlock from './components/PhotoUploadBlock';
import SymptomSelectBlock from './components/SymptomSelectBlock';

// 필수 증상 4가지 정의
const ALL_SYMPTOMS: SymptomKey[] = ['REDNESS', 'SWELLING', 'PAIN', 'DRYNESS'];

/** 공용 블록 Wrapper */
function Section({
  label,
  children,
  labelColor = 'text-text-secondary',
  gapClass = 'gap-2',
}: {
  label: string;
  children: React.ReactNode;
  labelColor?: string;
  gapClass?: string;
}) {
  return (
    <section className={cn('flex w-full flex-col', gapClass)}>
      <h2 className={cn('typo-section', labelColor)}>{label}</h2>
      {children}
    </section>
  );
}

export default function RecordCreatePage() {
  const navigate = useNavigate();

  // 1. URL Query Parameter에서 cardId 읽어오기
  const [searchParams] = useSearchParams();
  const cardId = searchParams.get('cardId') ?? '';

  // 2. useCardDetail 훅으로 카드 정보 직접 조회
  const { data: cardDetail, isLoading: isCardLoading } = useCardDetail(cardId);
  const { mutate: createRecord, isPending } = useCreateRecord(cardId);

  // cardId가 없으면 기록 등록 불가
  const hasCardId = Boolean(cardId);

  // 카드 상세 데이터 및 디스플레이 텍스트 바인딩
  const targetCardId = cardDetail?.id ?? cardId;
  const displayTitle = !hasCardId
    ? '카드를 선택해주세요'
    : cardDetail?.name ?? '시술 정보 불러오는 중...';
  const displayDateInfo = cardDetail
    ? `D+${cardDetail.dday} · ${cardDetail.treatedAt} 시술`
    : '';

  const dailyUsage = { maxCount: 3, todayCount: 0 };
  const isLimitReached = dailyUsage.todayCount >= dailyUsage.maxCount;

  // 입력 상태
  const [memo, setMemo] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);

  // 🎯 1. 증상 4개는 필수 고정
  const selectedSymptoms: SymptomKey[] = ALL_SYMPTOMS;

  // 🎯 2. 증상 정도 — 초기값 undefined (사용자가 실제로 선택해야 유효)
  const [symptomLevels, setSymptomLevels] = useState<Record<SymptomKey, Intensity | undefined>>({
    REDNESS: undefined,
    SWELLING: undefined,
    PAIN: undefined,
    DRYNESS: undefined,
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setPhotos((prev) => [...prev, ...selectedFiles].slice(0, 5));
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleIntensityChange = (symptom: SymptomKey, level: Intensity) => {
    setSymptomLevels((prev) => ({ ...prev, [symptom]: level }));
  };

  // 🎯 4. 유효성 검사: 4개 증상 정도가 모두 실제로 선택되었는지 확인 (1 이상)
  const isAllSymptomsRated = ALL_SYMPTOMS.every(
    (key) => symptomLevels[key] !== undefined && symptomLevels[key] > 0
  );

  const handleSubmit = () => {
    if (!hasCardId || !targetCardId || !isAllSymptomsRated || photos.length === 0) return;

    createRecord(
      {
        photo: photos[0],
        statusDescription: memo,
        tags: JSON.stringify(
          ALL_SYMPTOMS.map((symptom) => ({
            name: symptom,
            intensity: symptomLevels[symptom],
          }))
        ),
      },
      {
        onSuccess: (data) => {
          const recordId = data?.recordId ?? 0;
          navigate(`/records/${recordId}/feedback`);
        },
      }
    );
  };

  const subText = isLimitReached
    ? `오늘 분석 횟수(${dailyUsage.maxCount}회)를 모두 사용했어요 · 직전 피드백이 재사용돼요`
    : `하루 ${dailyUsage.maxCount}회까지 분석할 수 있어요 · 오늘 ${dailyUsage.todayCount}회 사용`;

  return (
    <div className="min-h-screen bg-surface-canvas">
      <main className="flex w-full flex-col gap-3.5 px-5 pt-5 pb-28">
        <NavHeader title="상태 기록" />

        {/* TargetCard */}
        <div className="flex w-full items-center justify-between rounded-btn bg-surface-fill px-3 py-2">
          <span className="typo-label text-text-primary">
            {isCardLoading ? '불러오는 중...' : displayTitle}
          </span>
          <span className="typo-caption text-right text-text-tertiary">
            {displayDateInfo}
          </span>
        </div>

        {/* 1. 사진 블록 */}
        <Section label="사진" labelColor="text-text-primary">
          <PhotoUploadBlock
            photos={photos}
            onSelectPhoto={handlePhotoSelect}
            onRemovePhoto={handleRemovePhoto}
          />
        </Section>

        {/* 2. 상태 입력 블록 */}
        <Section label="지금 상태" labelColor="text-text-primary">
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="붉은기가 어제보다 옅어졌어요"
            className="typo-body w-full resize-none rounded-md border border-border-subtle bg-surface-raised px-[14px] pt-[14px] pb-[34px] text-text-primary outline-none transition-colors placeholder:text-text-disabled focus:border-border-strong"
            rows={2}
          />
        </Section>

        {/* 3. 증상 선택 블록 (4개 필수 고정) */}
        <Section label="증상 (필수 4종)" labelColor="text-text-primary">
          <SymptomSelectBlock
            selectedSymptoms={selectedSymptoms}
            disabled
          />
        </Section>

        {/* 4. 증상 강도 선택 블록 */}
        <Section label="증상 강도" labelColor="text-text-primary" gapClass="gap-[10px]">
          <IntensitySelectBlock
            selectedSymptoms={selectedSymptoms}
            symptomLevels={symptomLevels}
            onChangeIntensity={handleIntensityChange}
          />
        </Section>
      </main>

      <BottomCTA
        label={isPending ? '등록 중...' : '기록 등록하기'}
        disabled={isPending || isCardLoading || !hasCardId || !isAllSymptomsRated || photos.length === 0}
        onClick={handleSubmit}
        subText={subText}
      />
    </div>
  );
}