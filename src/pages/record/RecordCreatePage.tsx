import { useState } from 'react';

import BottomCTA from '../../components/BottomCTA';
import Chip from '../../components/Chip';
import NavHeader from '../../components/NavHeader';
import Segment from '../../components/Segment';

import { useCreateRecord } from '../../hooks/record/useRecord';
import { cn } from '../../lib/cn';
import { SYMPTOM_LABEL, type Intensity, type SymptomKey } from '../../types/common';

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

const ALL_SYMPTOMS: SymptomKey[] = ['REDNESS', 'SWELLING', 'PAIN', 'DRYNESS'];
const INTENSITY_OPTIONS: { label: string; value: Intensity }[] = [
  { label: '없음', value: 0 },
  { label: '약간', value: 1 },
  { label: '보통', value: 2 },
  { label: '심함', value: 3 },
];

interface RecordCreatePageProps {
  /** BE 연동/Zod 스키마 수신 데이터 (기본값 제공) */
  cardId?: string;
  treatmentName?: string;
  treatmentDateInfo?: string;
  /** 🔥 유저 일일 분석 사용 현황 데이터 (BE 연동 준비) */
  dailyUsage?: {
    maxCount: number;
    todayCount: number;
  };
}

export default function RecordCreatePage({
  cardId = 'card-1',
  treatmentName = '포텐자',
  treatmentDateInfo = 'D+7 · 2026.07.25 시술',
  dailyUsage = { maxCount: 3, todayCount: 1 }, // BE 연동 전 임시 기본값
}: RecordCreatePageProps) {
  const { mutate: createRecord, isPending } = useCreateRecord();

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
    createRecord({
      cardId,
      memo,
      photoUrls: [], // S3 / Image Upload API 스키마 확정 시 매핑 연결
      symptoms: selectedSymptoms.map((symptom) => ({
        key: symptom,
        intensity: symptomLevels[symptom],
      })),
    });
  };

  // 🔥 동적 서브텍스트 생성
  const subText = `하루 ${dailyUsage.maxCount}회까지 분석할 수 있어요 · 오늘 ${dailyUsage.todayCount}회 사용`;

  return (
    <div className="min-h-screen bg-surface-canvas">
      {/* Content 영역 */}
      <main className="flex w-full flex-col gap-3.5 px-5 pt-5 pb-28">
        {/* NavHeader */}
        <NavHeader title="상태 기록" />

        {/* TargetCard */}
        <div className="flex w-full items-center justify-between rounded-btn bg-surface-fill px-3 py-2">
          <span className="typo-label text-text-primary">{treatmentName}</span>
          <span className="typo-caption text-right text-text-tertiary">
            {treatmentDateInfo}
          </span>
        </div>

        {/* PhotoBlock */}
        <Section label="사진" labelColor="text-text-primary">
          <input
            id="camera-input"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoSelect}
          />
          <input
            id="album-input"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoSelect}
          />

          <div className="flex w-full items-start gap-2">
            <label
              htmlFor="camera-input"
              className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border-subtle bg-surface-raised py-7 transition-colors hover:bg-surface-elevated"
            >
              <span className="typo-label text-center text-text-secondary">촬영</span>
            </label>

            <label
              htmlFor="album-input"
              className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border-subtle bg-surface-raised py-7 transition-colors hover:bg-surface-elevated"
            >
              <span className="typo-label text-center text-text-secondary">앨범에서 선택</span>
            </label>
          </div>

          {photos.length > 0 && (
            <div className="mt-1 grid grid-cols-3 gap-2">
              {photos.map((file, idx) => (
                <div
                  key={idx}
                  className="relative h-20 w-full overflow-hidden rounded-md bg-surface-raised"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`선택 사진 ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface-overlay text-text-primary-on typo-caption"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* StateBlock */}
        <Section label="지금 상태" labelColor="text-text-primary">
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="붉은기가 어제보다 옅어졌어요"
            className="typo-body w-full resize-none rounded-md border border-border-subtle bg-surface-raised px-[14px] pt-[14px] pb-[34px] text-text-primary outline-none transition-colors placeholder:text-text-disabled focus:border-border-strong"
            rows={2}
          />
        </Section>

        {/* SymptomBlock */}
        <Section label="증상" labelColor="text-text-primary">
          <div className="flex w-full items-start gap-2">
            {ALL_SYMPTOMS.map((key) => {
              const isSelected = selectedSymptoms.includes(key);
              return (
                <Chip
                  key={key}
                  className={cn(
                    'flex-1 cursor-pointer justify-center px-3 py-[6px] text-center transition-colors border',
                    isSelected
                      ? 'border-primary bg-primary-tint text-primary'
                      : 'border-border-strong bg-transparent text-text-secondary'
                  )}
                  onClick={() => toggleSymptom(key)}
                >
                  {SYMPTOM_LABEL[key] ?? key}
                </Chip>
              );
            })}
          </div>
        </Section>

        {/* IntensityBlock */}
        {selectedSymptoms.length > 0 && (
          <Section label="증상 정도" labelColor="text-text-primary" gapClass="gap-[10px]">
            <div className="flex w-full flex-col gap-[10px]">
              {selectedSymptoms.map((symptomKey) => (
                <div key={symptomKey} className="flex w-full items-center gap-[10px]">
                  <span className="typo-body w-12 shrink-0 text-text-secondary">
                    {SYMPTOM_LABEL[symptomKey]}
                  </span>

                  {/* segments */}
                  <div className="flex flex-1 items-center gap-[2px] rounded-btn bg-surface-fill p-[3px]">
                    {INTENSITY_OPTIONS.map((option) => {
                      const isSelected = symptomLevels[symptomKey] === option.value;
                      return (
                        <Segment
                          key={option.value}
                          selected={isSelected}
                          className={cn(
                            'typo-body border-none rounded-[6px] py-[6px] px-0',
                            isSelected
                              ? 'bg-primary text-primary-on'
                              : 'bg-transparent text-text-secondary'
                          )}
                          onClick={() => handleIntensityChange(symptomKey, option.value)}
                        >
                          {option.label}
                        </Segment>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </main>

      {/* 하단 CTA */}
      <BottomCTA
        label={isPending ? '등록 중...' : '기록 등록하기'}
        disabled={isPending || dailyUsage.todayCount >= dailyUsage.maxCount}
        onClick={handleSubmit}
        subText={subText}
      />
    </div>
  );
}