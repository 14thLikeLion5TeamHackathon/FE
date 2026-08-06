import { useParams } from 'react-router';

import NavHeader from '../../components/NavHeader';

/**
 * 일정 직접 입력 — 자리표시자.
 * 담당: 윤서
 *
 * 추가·수정 공용 화면이다. `scheduleId` 유무로 갈린다.
 * 입력 항목: 제목* · 날짜* · 시간(선택, 종일 스위치) · 장소(선택).
 * 수정일 때만 `일정 삭제`가 보이고, 하단 고정 CTA(BottomCTA)를 쓴다.
 *
 * 진입점은 오늘 탭 캘린더 헤더 우측의 `+ 일정` 칩이다.
 *
 * 시안을 보고 이 파일 안을 채우면 된다. 라우트는 이미 연결돼 있다.
 */
export default function ScheduleFormPage() {
  const { scheduleId } = useParams();
  const isEdit = Boolean(scheduleId);

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      <NavHeader title={isEdit ? '일정 수정' : '일정 추가'} />
      <p className="typo-body text-text-secondary">준비 중이에요.</p>
    </div>
  );
}
