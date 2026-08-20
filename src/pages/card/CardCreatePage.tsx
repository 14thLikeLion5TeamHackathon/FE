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
 * 시술 목록 장 넘김 버튼.
 *
 * 셰브론은 `NavHeader`·`CalendarNav`와 같은 8×14 형태다 — 한 앱 안에서 화살표 모양이
 * 갈리면 서로 다른 기능처럼 읽힌다. 아이콘만 있는 버튼이라 이름은 aria-label로 준다.
 */
function PageButton({
  label,
  direction,
  disabled,
  onClick,
}: {
  label: string;
  direction: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="bg-surface-raised border-border-subtle text-text-secondary rounded-sm flex size-9 items-center justify-center border transition-colors disabled:opacity-40"
    >
      <svg viewBox="0 0 8 14" className="h-3.5 w-2" fill="none" aria-hidden>
        <path
          d={direction === 'left' ? 'M7 1L1 7l6 6' : 'M1 1l6 6-6 6'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

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

  const [page, setPage] = useState(0);

  /**
   * 카테고리나 검색어가 바뀌면 첫 장으로 돌아간다.
   * 그대로 두면 3장을 보던 중 카테고리를 바꿨을 때 결과가 한 장뿐이라 빈 화면이 나온다.
   */
  const [pageScope, setPageScope] = useState(`${category}:${query}`);
  if (pageScope !== `${category}:${query}`) {
    setPageScope(`${category}:${query}`);
    setPage(0);
  }

  const { data, isLoading, isError, isFetching } = useTreatments(
    category,
    query || undefined,
    page,
  );
  const treatments = data?.content ?? [];

  /**
   * 끝 장인지. `hasNext`를 그대로 믿되 안 왔으면 `totalPages`로 물러나고,
   * 둘 다 없으면 넘길 수 있게 열어 둔다 — 모른다고 막으면 있는 장을 못 보게 된다.
   */
  const hasNext =
    data?.hasNext ??
    (data?.totalPages != null ? page + 1 < data.totalPages : treatments.length > 0);
  const totalPages = data?.totalPages ?? null;
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

      {!isLoading && !isError && treatments.length === 0 && (
        /*
          첫 장이 비면 정말 결과가 없는 것이다. 뒷장이 비는 건 다른 상황이라 —
          서버가 hasNext·totalPages를 둘 다 안 줘서 끝을 모르고 한 장 더 넘긴 경우다.
          그때 "시술이 없어요"라고 쓰면 카테고리 전체가 빈 것처럼 읽힌다.
        */
        <p className="typo-body text-text-secondary">
          {page === 0 ? '해당 카테고리에 시술이 없어요.' : '마지막 장이에요.'}
        </p>
      )}

      {!isLoading && !isError && treatments.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {treatments.map((treatment) => (
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

      {/*
            장을 이어 붙이지 않고 좌우로 넘긴다. 이 화면은 목록 아래에 시술 날짜와 만들기
            버튼이 기다리고 있어서, 목록이 길어질수록 그 자리가 멀어진다.

        한 장뿐이면 감춘다 — 누를 수 없는 버튼 두 개는 자리만 차지한다.

        **목록이 비어도 그린다.** 목록 안에 두면 뒷장이 비었을 때 돌아갈 길까지 같이
        사라져서, 사용자가 빈 화면에 갇힌다.
      */}
      {!isLoading && !isError && (page > 0 || hasNext) && (
        <div className="flex items-center justify-center gap-3">
          <PageButton
            label="이전 시술 목록"
            direction="left"
            disabled={page === 0 || isFetching}
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          />
          {/* 총 장수를 서버가 안 줄 수 있다. 그때는 현재 장만 말한다 */}
          <span className="typo-label text-text-secondary tabular-nums" aria-live="polite">
            {totalPages ? `${page + 1} / ${totalPages}` : `${page + 1}장`}
          </span>
          <PageButton
            label="다음 시술 목록"
            direction="right"
            disabled={!hasNext || isFetching}
            onClick={() => setPage((prev) => prev + 1)}
          />
        </div>
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
