import type { Schedule } from '../../../types/schedule';

type TodaySchedulesProps = {
  schedules: Schedule[];
  onAdd: () => void;
  onEdit: (schedule: Schedule) => void;
  /**
   * 목록을 못 받아온 상태. 빈 배열과 구분해야 한다 —
   * 모르는 걸 "없다"고 쓰면 일정이 있는 사용자에게 거짓말이 된다.
   */
  unavailable?: boolean;
  /** 오늘이 아닌 날짜를 보고 있을 때의 날짜("8월 19일"). 오늘이면 넘기지 않는다 */
  dateLabel?: string;
};

/**
 * 오늘 일정 블록.
 *
 * 근거 블록(`CareEvidence`) 안에 접혀 있던 걸 꺼내 독립 블록으로 올렸다.
 * 근거는 "왜 그렇게 안내했는지"를 읽는 자리라 편집 기능이 그 안에 있으면 찾을 수가 없다 —
 * 실제로 수정·삭제 API가 다 있는데도 화면에서 닿을 방법이 없었다.
 *
 * 일정이 없어도 블록째 감추지 않는다. 감추면 추가할 자리도 같이 사라진다.
 *
 * 직접 입력한 일정과 연동 캘린더 일정이 **한 목록에 섞여 온다**(HomePage 참고).
 * 캘린더 쪽은 `editable: false`라 누를 수 없는 줄로 그리고 출처를 밝힌다.
 */
export default function TodaySchedules({
  schedules,
  onAdd,
  onEdit,
  unavailable = false,
  dateLabel,
}: TodaySchedulesProps) {
  return (
    <section className="bg-surface-raised rounded-md flex flex-col gap-2.5 p-4">
      <header className="flex items-center justify-between">
        <h2 className="typo-label text-text-tertiary">
          {dateLabel ? `${dateLabel} 일정` : '오늘 일정'}
        </h2>
        <button
          type="button"
          onClick={onAdd}
          className="bg-primary-tint rounded-chip typo-caption text-primary px-2.5 py-1"
        >
          + 추가
        </button>
      </header>

      {/*
        모른다는 안내는 목록을 **대신하지 않고 위에 얹는다.**
        브리핑을 못 받아도 캘린더 일정은 아는 경우가 있어서, 안내로 갈아치우면
        알고 있는 줄까지 감추게 된다.
      */}
      {unavailable && (
        <p className="typo-caption text-text-tertiary">
          직접 넣은 일정은 아직 불러올 수 없어요. 추가는 지금 할 수 있어요
        </p>
      )}

      {unavailable && schedules.length === 0 ? null : schedules.length === 0 ? (
        <p className="typo-caption text-text-tertiary">등록한 일정이 없어요</p>
      ) : (
        <ul className="flex flex-col">
          {schedules.map((schedule) => {
            const content = (
              <>
                <span className="typo-caption text-text-tertiary w-16 shrink-0">
                  {schedule.time ?? '종일'}
                </span>
                <span className="typo-caption text-text-secondary flex-1 truncate">
                  {schedule.title}
                </span>
                {schedule.place && (
                  <span className="typo-caption text-text-tertiary truncate">{schedule.place}</span>
                )}
              </>
            );

            /*
              캘린더에서 가져온 일정은 눌러도 갈 곳이 없다 — 수정·삭제를 서버가 거절한다.
              버튼으로 두면 눌렀다가 실패 문구를 보게 되므로, 아예 누를 수 없는 줄로 그리고
              대신 어디서 온 일정인지 밝힌다.
            */
            if (!schedule.editable) {
              return (
                <li
                  key={schedule.id}
                  className="-mx-1.5 flex w-full items-center gap-2 px-1.5 py-1.5"
                >
                  {content}
                  <span className="typo-caption text-text-tertiary shrink-0">캘린더</span>
                </li>
              );
            }

            return (
              <li key={schedule.id}>
                {/* 행 전체가 버튼이다 — 목록에서 바로 수정 화면으로 간다 */}
                <button
                  type="button"
                  onClick={() => onEdit(schedule)}
                  className="hover:bg-surface-elevated rounded-sm -mx-1.5 flex w-full items-center gap-2 px-1.5 py-1.5 text-left transition-colors"
                >
                  {content}
                  <span className="typo-caption text-text-tertiary shrink-0" aria-hidden>
                    ›
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
