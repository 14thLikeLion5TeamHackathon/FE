import { useNavigate, useParams } from 'react-router';

import Chip from '../../components/Chip';
import NavHeader from '../../components/NavHeader';
import { useFeedback } from '../../hooks/feedback/useFeedback';
import SymptomDeltaList from './components/SymptomDeltaList';

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
  const { data, isLoading, isError } = useFeedback(recordId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6" aria-busy="true">
        <NavHeader title="AI 피드백" />
        <div className="bg-surface-raised rounded-md h-56 animate-pulse" />
        <div className="bg-surface-raised rounded-md h-32 animate-pulse" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
        <NavHeader title="AI 피드백" />
        <p className="typo-body text-text-secondary">피드백을 불러오지 못했어요.</p>
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
          {[data.before, data.after].map((side, index) => (
            <figure key={side.ddayLabel} className="flex flex-1 flex-col gap-1.5">
              <div className="bg-surface-fill border-border-subtle rounded-md aspect-square w-full border" />
              <figcaption
                className={index === 0 ? 'typo-caption text-text-tertiary' : 'typo-caption text-text-primary'}
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
          <p className="typo-caption text-text-tertiary">회복 곡선에는 기록하신 값을 그대로 씁니다</p>
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
          <button
            type="button"
            className="bg-danger typo-label rounded-btn mt-1 py-3 text-white"
            onClick={() => {}}
          >
            시술 기관에 문의하기
          </button>
        </section>
      ) : (
        <p className="bg-surface-fill rounded-md typo-caption text-text-tertiary p-4">
          {data.advice.message}
        </p>
      )}

      <button
        type="button"
        onClick={() => navigate(`/cards/${data.cardId}`)}
        className="bg-primary text-primary-on typo-label rounded-btn py-4"
      >
        피드백 저장하기
      </button>
    </div>
  );
}
