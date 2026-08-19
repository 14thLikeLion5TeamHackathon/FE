import { useState } from 'react';
import { useNavigate } from 'react-router';

import BottomCTA from '../../components/BottomCTA';
import Card from '../../components/Card';
import DateField from '../../components/DateField';
import Field from '../../components/Field';
import NavHeader from '../../components/NavHeader';
import SectionHeader from '../../components/SectionHeader';
import { useCreateCard, useTreatments } from '../../hooks/card/useCard';
import { toDateInputValue } from '../../lib/date';
import { CATEGORY_LABEL, TreatmentCategory } from '../../types/card';
import CategoryChip from './components/CategoryChip';
import TreatmentListItem from './components/TreatmentListItem';
import Skeleton from '../../components/Skeleton';

const CATEGORIES = TreatmentCategory.options;

/**
 * 받은 케어 등록 — 시술 검색·선택 → 시술 날짜 → 카드 생성.
 * 담당: 윤서
 */
export default function CardCreatePage() {
  const navigate = useNavigate();

  const [category, setCategory] = useState<TreatmentCategory>(CATEGORIES[0]);
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [treatedAt, setTreatedAt] = useState('');

  const { data: treatments, isLoading, isError } = useTreatments(category, query || undefined);
  const { mutate: createCard, isPending } = useCreateCard();

  const toggleTreatment = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const isValid = selectedIds.length > 0 && treatedAt.trim() !== '';

  const handleSubmit = () => {
    createCard(
      {
        treatmentDate: toDateInputValue(treatedAt),
        treatments: selectedIds.map((treatmentId) => ({ treatmentId })),
      },
      {
        /*
          등록 화면을 히스토리에서 걷어내고 그 자리에 회복 탭을 깐 뒤 상세로 간다.
          그냥 push하면 상세에서 뒤로 갔을 때 방금 제출한 등록 폼이 다시 나온다.
          회복 탭을 고른 건 새로 만든 카드가 거기 목록에 보이기 때문이다 —
          어디서 들어왔든(오늘 빈 상태·회복·탭바 +) 돌아갈 자리가 같아진다.

          cardId가 비어 오면 상세로 못 간다. 그렇다고 실패로 보이면 사용자가 같은 카드를
          또 만드니, 회복 탭에서 멈춘다.
        */
        onSuccess: (card) => {
          navigate('/recovery', { replace: true });
          if (card.cardId) navigate(`/cards/${card.cardId}`);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-28">
      <NavHeader title="받은 케어 등록" />

      <div className="relative">
        <svg
          viewBox="0 0 16 16"
          className="text-text-tertiary pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2"
          fill="none"
          aria-hidden
        >
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M11 11L14.5 14.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <Field
          type="text"
          placeholder="시술명을 검색하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {CATEGORIES.map((value) => (
          <CategoryChip
            key={value}
            selected={category === value}
            onClick={() => setCategory(value)}
          >
            {CATEGORY_LABEL[value]}
          </CategoryChip>
        ))}
      </div>

      <SectionHeader
        title="시술 선택"
        action={
          <span className="typo-caption text-text-secondary">{selectedIds.length}개 선택됨</span>
        }
      />

      {isLoading && (
        <div className="flex flex-col gap-2.5" aria-busy="true">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      )}

      {isError && <p className="typo-body text-text-secondary">시술 목록을 불러오지 못했어요.</p>}

      {!isLoading && !isError && (treatments?.length ?? 0) === 0 && (
        <p className="typo-body text-text-secondary">해당 카테고리에 시술이 없어요.</p>
      )}

      {!isLoading && !isError && (treatments?.length ?? 0) > 0 && (
        <ul className="flex flex-col gap-2.5">
          {treatments?.map((treatment) => (
            <li key={treatment.treatmentId}>
              <TreatmentListItem
                treatment={treatment}
                selected={selectedIds.includes(treatment.treatmentId)}
                onToggle={() => toggleTreatment(treatment.treatmentId)}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2">
        <p className="typo-label text-text-primary">시술 날짜</p>
        <DateField value={treatedAt} onChange={setTreatedAt} label="시술일" />
      </div>

      <Card variant="block" className="flex items-start gap-2.5">
        {/* 인증 배지 — 원이 아니라 꽃잎 8장을 두른 톱니 모양 실루엣 */}
        <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden>
          <g className="fill-primary">
            <circle cx="16" cy="16" r="10" />
            <circle cx="27" cy="16" r="4.5" />
            <circle cx="23.78" cy="23.78" r="4.5" />
            <circle cx="16" cy="27" r="4.5" />
            <circle cx="8.22" cy="23.78" r="4.5" />
            <circle cx="5" cy="16" r="4.5" />
            <circle cx="8.22" cy="8.22" r="4.5" />
            <circle cx="16" cy="5" r="4.5" />
            <circle cx="23.78" cy="8.22" r="4.5" />
          </g>
          <path
            d="M11 16.5L14.5 20L21.5 12.5"
            fill="none"
            className="stroke-primary-on"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <p className="typo-body text-text-primary">시술 기록은 안전하게 보관돼요</p>
          <p className="typo-caption text-text-tertiary mt-1">
            등록된 데이터는 본인만 확인할 수 있도록 암호화됩니다
          </p>
        </div>
      </Card>

      <BottomCTA label="케어 카드 만들기" disabled={!isValid || isPending} onClick={handleSubmit} />
    </div>
  );
}
