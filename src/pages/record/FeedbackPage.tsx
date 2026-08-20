import { useNavigate, useParams } from 'react-router';

import { HttpStatus, type ApiError } from '../../api/types';
import Chip from '../../components/Chip';
import NavHeader from '../../components/NavHeader';
import { useFeedback } from '../../hooks/feedback/useFeedback';
import { useCardDetail } from '../../hooks/card/useCard';
import { getLocationParams } from '../../lib/location';
import { mediaUrl } from '../../lib/mediaUrl';
import SymptomDeltaList from './components/SymptomDeltaList';
import Skeleton from '../../components/Skeleton';

/** 제목 + 본문을 감싸는 카드. 이 화면이 블록을 여러 개 쌓아서 따로 뺐다. */
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface-raised rounded-md flex flex-col gap-2.5 p-4">
      <h2 className="typo-section">{title}</h2>
      {children}
    </section>
  );
}

/**
 * AI 피드백 — 기록 직후 결과 화면.
 *
 * 비교는 항상 `직전 기록 → 방금 기록` 1:1이다.
 * 기록 시점에 생성되는 화면이라 미래 데이터가 없고, 전체 흐름은 회복 탭이 담당한다.
 *
 * 결과·조회 화면이라 저장 버튼은 하단 고정 CTA가 아니라 콘텐츠 흐름 안에 둔다.
 */
export default function FeedbackPage() {
  const { recordId = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useFeedback(recordId);
  const cardId = data?.cardId ? String(data.cardId) : '';
  /** 문의 버튼이 열 주소. 카드 상세에만 있어서 피드백 응답과 별개로 한 번 더 받는다 */
  const { data: cardDetail, isLoading: isStoreLoading } = useCardDetail(
    cardId,
    getLocationParams(),
  );
  const storeUrl = cardDetail?.visitedStore?.url;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6" aria-busy="true">
        <NavHeader title="AI 피드백" />
        <Skeleton className="h-56" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (isError || !data) {
    const apiError = error as ApiError | null;

    // 4xx는 서버가 이미 사용자에게 보여줄 문구를 담아 보낸다 (예: 하루 3회 분석 제한).
    // 5xx·네트워크 실패는 원인이 서버·인프라 쪽이라 원문을 보여줘도 사용자가 할 수 있는 게 없으니
    // 공통 문구로 뭉갠다. 봉투가 없는 에러는 message가 axios 기본 문구로 채워지지만,
    // 그 경우도 4xx면 서버 응답 자체는 있었다는 뜻이라 그대로 노출한다.
    const isClientError =
      typeof apiError?.status === 'number' && apiError.status >= 400 && apiError.status < 500;
    const serverMessage = isClientError ? apiError?.message : null;
    const isQuotaExceeded = apiError?.status === HttpStatus.TOO_MANY_REQUESTS;

    return (
      <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
        <NavHeader title="AI 피드백" />
        <p className="typo-body text-text-secondary">
          {serverMessage ?? '피드백을 불러오지 못했어요.'}
        </p>
        {/* 할당량 소진은 오류가 아니라 정상적으로 닿는 상태다. 기록 등록 화면 subText와 톤을 맞춘다. */}
        {isQuotaExceeded && (
          <p className="typo-caption text-text-tertiary">직전에 만든 피드백은 계속 볼 수 있어요.</p>
        )}
      </div>
    );
  }

  const warn = data.advice.required;

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      <NavHeader title="AI 피드백" />

      {/* 대상 카드 — 어떤 케어의 기록인지 */}
      <div className="bg-surface-fill rounded-md flex items-center justify-between px-4 py-3">
        <span className="typo-label text-text-primary">{data.cardName}</span>
        <span className="typo-caption text-text-tertiary">{data.contextLabel}</span>
      </div>

      <Block title="지난 기록과 비교">
        <div className="flex items-center gap-2">
          {/* 라벨이 같을 수 있어(첫 기록이면 양쪽 다 오늘) key는 자리로 잡는다 */}
          {[data.before, data.after].map((side, index) => (
            <figure key={index === 0 ? 'before' : 'after'} className="flex flex-1 flex-col gap-1.5">
              {side.photoUrl ? (
                <img
                  src={mediaUrl(side.photoUrl)}
                  alt={`${side.ddayLabel} 기록 사진`}
                  className="bg-surface-fill border-border-subtle aspect-square w-full rounded-md border object-cover"
                />
              ) : (
                /* 첫 기록이면 비교할 이전 사진이 없다 — 빈 자리를 그대로 둔다 */
                <div className="bg-surface-fill border-border-subtle aspect-square w-full rounded-md border" />
              )}
              <figcaption
                className={
                  index === 0 ? 'typo-caption text-text-tertiary' : 'typo-caption text-text-primary'
                }
              >
                {side.ddayLabel}
              </figcaption>
            </figure>
          ))}
        </div>

        <SymptomDeltaList deltas={data.deltas} />

        {data.quotedMemo && (
          <>
            <div className="bg-border-subtle h-px w-full" aria-hidden />
            <blockquote className="typo-body text-text-primary">“{data.quotedMemo}”</blockquote>
          </>
        )}
      </Block>

      <Block title="분석">
        <p className="typo-body text-text-primary">{data.analysis}</p>
        {data.evidence.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.evidence.map((chip) => (
              <Chip key={chip.label}>{chip.label}</Chip>
            ))}
          </div>
        )}
      </Block>

      {data.intensityReview && (
        <Block title="기록 강도 검토">
          <p className="typo-body text-text-primary">{data.intensityReview}</p>
          {/* 곡선의 소스는 사용자 입력이다. AI는 점수를 덮어쓰지 않고 해석만 얹는다 */}
          <p className="typo-caption text-text-tertiary">
            회복 곡선에는 기록하신 값을 그대로 씁니다
          </p>
        </Block>
      )}

      <Block title="오늘의 관리">
        <ul className="flex flex-col gap-2">
          {data.todayCare.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="bg-primary mt-1.5 size-1 shrink-0 rounded-full" aria-hidden />
              <span className="typo-body text-text-primary">{item}</span>
            </li>
          ))}
        </ul>
      </Block>

      {/*
        문의 권고는 AI 판단이 아니라 규칙으로 뜬다.
        어떤 규칙에 걸렸는지를 함께 보여줘야 사용자가 납득할 수 있다.
      */}
      {warn ? (
        <section className="border-danger rounded-md flex flex-col gap-2.5 border p-4">
          <h2 className="typo-section text-danger flex items-center gap-1.5">
            <span aria-hidden>⚠</span> 주의가 필요한 상태예요
          </h2>
          <p className="typo-body text-text-primary">{data.advice.message}</p>
          {data.advice.criteria && (
            <p className="typo-caption text-text-tertiary">판정 기준: {data.advice.criteria}</p>
          )}
          {/*
            **버튼이 아니라 링크다.** `window.open`을 부르는 버튼으로 두면 우클릭·새 탭으로
            열기·링크 주소 복사가 전부 막히고, 낭독기도 "버튼"이라고만 읽어 어디로 가는지
            모른다. 같은 이유로 카드 상세의 매장 바로가기도 링크로 바꿨다(StoreGuide).

            주소를 모르면 링크를 그리지 않는다. 눌러도 아무 일이 없는 버튼은 사용자에게
            고장으로 읽히는데, 여기는 "문의하라"고 권해 놓은 자리라 더 나쁘다.
          */}
          {storeUrl ? (
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-danger typo-label rounded-btn mt-1 flex items-center justify-center gap-1.5 py-3 text-white"
              aria-label="시술 기관 홈페이지 열기 (새 창)"
            >
              시술 기관에 문의하기
              {/* 새 창으로 나간다는 관습적 표시 — 상자 밖으로 빠지는 화살표 */}
              <svg viewBox="0 0 12 12" className="size-3" fill="none" aria-hidden>
                <path
                  d="M4.5 2H2.5V9.5H10V7.5M7 2H10V5M10 2L5.5 6.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          ) : isStoreLoading ? (
            /*
              **아직 받는 중인 것과 없는 것을 구분한다.** 카드 상세는 피드백 응답보다 늦게
              오는데, 그 사이 "등록돼 있지 않아요"를 띄우면 잠깐이라도 그게 결론으로 읽힌다.
            */
            <Skeleton className="bg-surface-fill mt-1 h-11 w-full" />
          ) : (
            <p className="typo-caption text-text-tertiary mt-1">
              시술 기관 연락처가 등록돼 있지 않아요. 방문하신 곳으로 직접 문의해주세요.
            </p>
          )}
        </section>
      ) : (
        <p className="bg-surface-fill rounded-md typo-caption text-text-tertiary p-4">
          {data.advice.message}
        </p>
      )}

      <button
        type="button"
        /*
          cardId가 비어 올 수 있어(계약상 required가 없다) 그때는 회복 탭으로 보낸다 —
          `/cards/`로 가면 존재하지 않는 카드 상세가 열려 사용자가 막힌다.
          replace인 이유는 상세에서 뒤로 갔을 때 이미 확인한 피드백이 또 나오지 않게 하려는 것.
        */
        onClick={() =>
          navigate(data.cardId ? `/cards/${data.cardId}` : '/recovery', { replace: true })
        }
        className="bg-primary text-primary-on typo-label rounded-btn py-4"
      >
        케어 카드로 이동
      </button>
    </div>
  );
}
