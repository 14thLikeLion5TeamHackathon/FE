type TodayEnvironmentProps = {
  /** "8월 19일 (수)" */
  dateLabel: string;
  /** "온흐림 28°" — 못 받았으면 null */
  weather: string | null;
};

/**
 * 케어 카드가 없을 때 브리핑 자리를 대신하는 블록.
 *
 * 카드가 없으면 서버가 줄 판단이 없다. 그렇다고 화면을 비워두면 앱이 고장난 것처럼 보이는데,
 * 날짜와 날씨는 카드와 무관하게 유효한 정보다. 결론 대신 사실만 보여주고,
 * 판단이 필요하면 카드를 만들면 된다고 아래 블록이 이어받는다.
 *
 * `CareBriefing`을 쓰지 않은 이유: 그건 "행동 문장"이 본문이라 판단이 없는 화면에 맞지 않는다.
 */
export default function TodayEnvironment({ dateLabel, weather }: TodayEnvironmentProps) {
  return (
    <section className="bg-surface-raised rounded-md flex items-baseline justify-between gap-2 p-4">
      <h2 className="typo-card-title">{dateLabel}</h2>
      {weather && <span className="typo-caption text-text-secondary">{weather}</span>}
    </section>
  );
}
