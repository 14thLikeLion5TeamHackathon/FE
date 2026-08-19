import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import BottomCTA from '../../components/BottomCTA';
import NavHeader from '../../components/NavHeader';

import { useCardDetail } from '../../hooks/card/useCard';
import { useCreateRecord, useStatusTags } from '../../hooks/record/useRecord';
import { cn } from '../../lib/cn';
import { getLocationParams } from '../../lib/location';
import { NO_TREATMENT_NAME } from '../../types/card';
import type { Intensity, SymptomKey } from '../../types/common';
import { SYMPTOM_TAG_KEY, toSymptomKey } from '../../types/record';

import IntensitySelectBlock from './components/IntensitySelectBlock';
import PhotoUploadBlock from './components/PhotoUploadBlock';
import SymptomSelectBlock from './components/SymptomSelectBlock';

/** 서버 태그를 아직 못 받았을 때 물러날 목록. 이 화면이 서면 시연 경로가 막힌다 */
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
  // TODO: city/district는 사용자 프로필 또는 위치 정보에서 가져오도록 연동 필요
  const { data: cardDetail, isLoading: isCardLoading } = useCardDetail(cardId, getLocationParams());
  const { mutate: createRecord, isPending, isError } = useCreateRecord(cardId);

  // cardId가 없으면 기록 등록 불가
  const hasCardId = Boolean(cardId);

  // 카드 상세 데이터 및 디스플레이 텍스트 바인딩
  const targetCardId = cardDetail?.cardId ?? cardId;
  const displayTitle = !hasCardId
    ? '카드를 선택해주세요'
    : (cardDetail?.treatmentName ?? (cardDetail ? NO_TREATMENT_NAME : '시술 정보 불러오는 중...'));
  const displayDateInfo = cardDetail
    ? [`D+${cardDetail.dday}`, cardDetail.treatmentDate && `${cardDetail.treatmentDate} 시술`]
        .filter(Boolean)
        .join(' · ')
    : '';

  // 스웨거 응답에 required가 없어서 횟수 정보가 통째로 비어 올 수 있다.
  // 그때 기록 자체를 막으면 안 되므로 "아직 안 썼다"로 두고 기본 한도(3회)를 쓴다.
  const feedbackQuota = {
    used: cardDetail?.feedbackQuota?.used ?? 0,
    total: cardDetail?.feedbackQuota?.total ?? 3,
  };
  const isLimitReached = feedbackQuota.used >= feedbackQuota.total;

  // 입력 상태
  const [memo, setMemo] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);

  /**
   * 화면에 띄울 증상 목록.
   *
   * 서버(`GET /api/v1/now/status-tags`)가 목록의 주인이다 — 상수로 박아두면 서버가
   * 증상을 하나 늘려도 화면에 안 나오고 기록에도 안 담긴다.
   * 아직 못 받았거나 아는 코드가 하나도 없으면 상수로 물러난다.
   * 태그 조회 실패가 기록 등록을 막으면 안 된다 — 여기가 서면 시연 경로가 통째로 막힌다.
   */
  const { data: statusTags } = useStatusTags();
  const selectedSymptoms: SymptomKey[] = useMemo(() => {
    const fromServer = (statusTags ?? [])
      .map((tag) => toSymptomKey(tag.code))
      .filter((key): key is SymptomKey => key !== null);
    return fromServer.length > 0 ? fromServer : ALL_SYMPTOMS;
  }, [statusTags]);

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

  // 🎯 4. 유효성 검사: 4개 증상 정도가 모두 실제로 선택되었는지 확인
  const isAllSymptomsRated = selectedSymptoms.every((key) => symptomLevels[key] !== undefined);

  const handleSubmit = () => {
    if (!hasCardId || !targetCardId || !isAllSymptomsRated || photos.length === 0) return;

    // 서버 tags는 배열이 아니라 `{ redness: 3, ... }` 형태의 강도 맵이다.
    const tags = selectedSymptoms.reduce<Record<string, Intensity>>((acc, symptom) => {
      const level = symptomLevels[symptom];
      if (level !== undefined) acc[SYMPTOM_TAG_KEY[symptom]] = level;
      return acc;
    }, {});

    createRecord(
      {
        photos,
        statusDescription: memo,
        tags: JSON.stringify(tags),
      },
      {
        onSuccess: (data) => {
          const recordId = data?.recordId ?? 0;
          navigate(`/records/${recordId}/feedback`);
        },
      }
    );
  };

  // 실패했는데 아무 말이 없으면 사용자는 버튼이 안 먹은 줄 알고 다시 누른다.
  // 등록은 서버에 이미 저장된 뒤일 수 있어서, 그 재시도가 같은 기록을 두 벌 만든다.
  const subText = isError
    ? '등록에 실패했어요. 이미 저장됐을 수 있으니 카드에서 확인해주세요.'
    : isLimitReached
      ? `오늘 분석 횟수(${feedbackQuota.total}회)를 모두 사용했어요 · 직전 피드백이 재사용돼요`
      : `하루 ${feedbackQuota.total}회까지 분석할 수 있어요 · 오늘 ${feedbackQuota.used}회 사용`;

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