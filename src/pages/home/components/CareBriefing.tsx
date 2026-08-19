import Button from '../../../components/Button';
import Skeleton from '../../../components/Skeleton';

/**
 * 메인 상단 브리핑 (시안 `CareBriefing`).
 *
 * 상태가 넷이지만 껍데기(카드 + 헤더 + 본문)는 같다 — 시안에서도 같은 컴포넌트의 변형이다.
 * 헤더 오른쪽 자리는 상태마다 다른 걸 넣는다: 날씨 / 스켈레톤 / `—` / `예보 없음`.
 *
 * 근거(환경지표·칩)는 CareEvidence로 분리했다 — 왜 → 무엇 → 근거 순서를 지키기 위함.
 * 일정은 읽기 전용이 아니라서 CareEvidence에서 다시 TodaySchedules로 빠졌다.
 */

type Props = {
  /** "8월 15일 (금)" */
  dateLabel: string;
};

function Shell({
  dateLabel,
  right,
  children,
}: Props & { right: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-surface-raised border-border-subtle rounded-md flex flex-col items-start gap-2.5 border p-4">
      <header className="flex w-full items-center justify-between overflow-clip whitespace-nowrap">
        <h2 className="typo-card-title">{dateLabel}</h2>
        {right}
      </header>
      {children}
    </section>
  );
}

/** 정상 */
export default function CareBriefing({
  dateLabel,
  weather,
  message,
}: Props & {
  /** "온흐림 26°". 서버가 날씨를 못 주면 null */
  weather: string | null;
  message: string;
}) {
  return (
    <Shell
      dateLabel={dateLabel}
      right={weather && <span className="typo-label text-text-secondary">{weather}</span>}
    >
      <p className="typo-body text-text-primary">{message}</p>
    </Shell>
  );
}

/**
 * 불러오는 중. 날짜는 이미 알고 있으므로 그대로 두고 나머지만 스켈레톤으로.
 *
 * 색은 `bg-surface-fill`로 덮는다 — Skeleton 기본색이 이 카드 배경과 같아서
 * 그대로 두면 상자가 배경에 묻혀 아무것도 안 뜨는 것처럼 보인다.
 */
export function CareBriefingLoading({ dateLabel }: Props) {
  return (
    <Shell dateLabel={dateLabel} right={<Skeleton className="bg-surface-fill h-2.5 w-[52px]" />}>
      <div className="flex w-full flex-col items-start gap-2" aria-busy="true">
        <Skeleton className="bg-surface-fill h-3 w-full" />
        <Skeleton className="bg-surface-fill h-3 w-[236px]" />
      </div>
    </Shell>
  );
}

/**
 * 데이터 로드 실패.
 * 화면을 막지 않고 "아래 케어 카드는 계속 볼 수 있다"고 알려주는 게 시안 의도다.
 */
export function CareBriefingError({ dateLabel, onRetry }: Props & { onRetry: () => void }) {
  return (
    <Shell dateLabel={dateLabel} right={<span className="typo-label text-text-secondary">—</span>}>
      <p className="typo-body text-text-primary">오늘 정보를 불러오지 못했어요</p>
      <p className="typo-body text-text-secondary">
        네트워크 상태를 확인한 뒤 다시 시도해주세요. 시술 D-day 안내는 아래 케어 카드에서 계속 볼 수
        있어요.
      </p>
      <Button onClick={onRetry}>다시 시도</Button>
    </Shell>
  );
}

/**
 * 날씨·대기질을 붙일 수 없는 날짜 — D-day 기준으로만 안내한다.
 *
 * 지난 날짜와 앞날을 **구분해서 말한다.** 어제를 보면서 "아직 예보가 없어요"를 읽으면
 * 문장이 틀린 게 되고, 사용자는 앱이 고장난 걸로 읽는다.
 *
 * `past`는 이제 "지난 날짜라서 안 부른다"가 아니라 **"불렀는데 그날 기록이 없었다"**는 뜻이다.
 * 지난 날짜도 서버에 물어본다 — DB에 그날 날씨가 남아 있으면 브리핑이 정상으로 온다.
 */
export function CareBriefingNoForecast({ dateLabel, past = false }: Props & { past?: boolean }) {
  return (
    <Shell
      dateLabel={dateLabel}
      right={
        <span className="typo-label text-text-secondary">{past ? '지난 날짜' : '예보 없음'}</span>
      }
    >
      <p className="typo-body text-text-primary w-full">
        {past
          ? '그날의 날씨·대기질 기록이 없어요. 시술 D-day 기준으로만 안내드릴게요.'
          : '이 날짜는 아직 날씨·대기질 예보가 없어요. 시술 D-day 기준으로만 안내드릴게요.'}
      </p>
    </Shell>
  );
}
