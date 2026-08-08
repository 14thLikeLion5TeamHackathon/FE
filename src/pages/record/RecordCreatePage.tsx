import { useState } from 'react';
import { useNavigate } from 'react-router';

import BottomCTA from '../../components/BottomCTA';
import NavHeader from '../../components/NavHeader';

import { useCreateRecord } from '../../hooks/record/useRecord';
import { cn } from '../../lib/cn';
import type { CareCard } from '../../types/card';
import type { Intensity, SymptomKey } from '../../types/common';

import IntensitySelectBlock from './components/IntensitySelectBlock';
import PhotoUploadBlock from './components/PhotoUploadBlock';
import SymptomSelectBlock from './components/SymptomSelectBlock';

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

interface RecordCreatePageProps {
  selectedCard?: CareCard;
  cardId?: string;
  treatmentName?: string;
  treatmentDateInfo?: string;
  dailyUsage?: {
    maxCount: number;
    todayCount: number;
  };
}

export default function RecordCreatePage({
  selectedCard,
  cardId = 'card-1',
  treatmentName = '포텐자',
  treatmentDateInfo = 'D+7 · 2026.07.25 시술',
  dailyUsage = { maxCount: 3, todayCount: 0 },
}: RecordCreatePageProps) {
  const navigate = useNavigate();
  const { mutate: createRecord, isPending } = useCreateRecord();

  const targetCardId = selectedCard?.id ?? cardId;
  const displayTitle = selectedCard?.name ?? treatmentName;
  const displayDateInfo = selectedCard
    ? `D+${selectedCard.dday} · ${selectedCard.treatedAt} 시술`
    : treatmentDateInfo;

  const isLimitReached = dailyUsage.todayCount >= dailyUsage.maxCount;

  // 입력 상태
  const [memo, setMemo] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomKey[]>(['REDNESS', 'SWELLING']);
  const [symptomLevels, setSymptomLevels] = useState<Record<SymptomKey, Intensity>>({
    REDNESS: 1,
    SWELLING: 2,
    PAIN: 0,
    DRYNESS: 0,
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setPhotos((prev) => [...prev, ...selectedFiles].slice(0, 5));
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSymptom = (symptom: SymptomKey) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleIntensityChange = (symptom: SymptomKey, level: Intensity) => {
    setSymptomLevels((prev) => ({ ...prev, [symptom]: level }));
  };

  const handleSubmit = () => {
    createRecord(
      {
        cardId: targetCardId,
        memo,
        photoUrls: [],
        symptoms: selectedSymptoms.map((symptom) => ({
          key: symptom,
          intensity: symptomLevels[symptom],
        })),
        usePreviousAnalysis: isLimitReached,
      } as Parameters<typeof createRecord>[0],
      {
        onSuccess: (data: { recordId: string }) => {
          const recordId = data?.recordId ?? 'temp-record-id';
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
          <span className="typo-label text-text-primary">{displayTitle}</span>
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

        {/* 3. 증상 선택 블록 */}
        <Section label="증상" labelColor="text-text-primary">
          <SymptomSelectBlock
            selectedSymptoms={selectedSymptoms}
            onToggleSymptom={toggleSymptom}
          />
        </Section>

        {/* 4. 증상 정도 선택 블록 */}
        {selectedSymptoms.length > 0 && (
          <Section label="증상 정도" labelColor="text-text-primary" gapClass="gap-[10px]">
            <IntensitySelectBlock
              selectedSymptoms={selectedSymptoms}
              symptomLevels={symptomLevels}
              onChangeIntensity={handleIntensityChange}
            />
          </Section>
        )}
      </main>

      <BottomCTA
        label={isPending ? '등록 중...' : '기록 등록하기'}
        disabled={isPending}
        onClick={handleSubmit}
        subText={subText}
      />
    </div>
  );
}