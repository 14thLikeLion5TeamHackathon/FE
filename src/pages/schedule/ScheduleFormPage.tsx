import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import BottomCTA from '../../components/BottomCTA';
import Button from '../../components/Button';
import Card from '../../components/Card';
import DateField from '../../components/DateField';
import Field from '../../components/Field';
import NavHeader from '../../components/NavHeader';
import Switch from '../../components/Switch';
import {
  useCreateSchedule,
  useDeleteSchedule,
  useSchedule,
  useUpdateSchedule,
} from '../../hooks/schedule/useSchedule';
import type { Schedule } from '../../types/schedule';

type ScheduleFormFieldsProps = {
  scheduleId?: string;
  isEdit: boolean;
  initialSchedule?: Schedule;
};

/**
 * 실제 폼 상태는 여기서만 다룬다.
 * 부모가 로딩·에러를 먼저 걸러낸 뒤에만 마운트하므로, 수정 모드에서도
 * `useState` 초기값으로 곧장 채울 수 있고 effect로 동기화할 필요가 없다.
 */
function ScheduleFormFields({ scheduleId, isEdit, initialSchedule }: ScheduleFormFieldsProps) {
  const navigate = useNavigate();

  const [title, setTitle] = useState(initialSchedule?.title ?? '');
  const [date, setDate] = useState(initialSchedule?.date ?? '');
  const [allDay, setAllDay] = useState(initialSchedule ? initialSchedule.time === null : false);
  const [time, setTime] = useState(initialSchedule?.time ?? '');
  const [place, setPlace] = useState(initialSchedule?.place ?? '');

  const { mutate: createSchedule, isPending: isCreating } = useCreateSchedule();
  const { mutate: updateSchedule, isPending: isUpdating } = useUpdateSchedule(scheduleId ?? '');
  const { mutate: deleteSchedule, isPending: isDeleting } = useDeleteSchedule();

  const isValid = title.trim() !== '' && date.trim() !== '';

  const handleSubmit = () => {
    const payload = {
      title,
      date,
      time: allDay ? null : time.trim() || null,
      place: place.trim() || null,
    };

    if (isEdit) {
      updateSchedule(payload, { onSuccess: () => navigate('/') });
    } else {
      createSchedule(payload, { onSuccess: () => navigate('/') });
    }
  };

  const handleDelete = () => {
    if (!scheduleId) return;
    deleteSchedule(scheduleId, { onSuccess: () => navigate('/') });
  };

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-28">
      <NavHeader title={isEdit ? '일정 수정' : '일정 추가'} />

      <div className="flex flex-col gap-2">
        <p className="typo-label text-text-primary">
          제목 <span className="text-primary">*</span>
        </p>
        <Field
          type="text"
          placeholder="예) 저녁 약속"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="typo-label text-text-primary">
          날짜 <span className="text-primary">*</span>
        </p>
        <DateField value={date} onChange={setDate} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="typo-label text-text-primary">
          시간 <span className="text-text-tertiary">(선택)</span>
        </p>
        <Card variant="block">
          <div className="flex items-center justify-between">
            <span className="typo-body text-text-primary">종일</span>
            <Switch checked={allDay} onChange={setAllDay} label="종일" />
          </div>
        </Card>
        {!allDay && (
          <Field
            type="text"
            placeholder="예) 오후 7:00"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="typo-label text-text-primary">
          장소 <span className="text-text-tertiary">(선택)</span>
        </p>
        <Field
          type="text"
          placeholder="장소를 입력하세요 (선택)"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
        />
        <p className="typo-caption text-text-tertiary">
          장소를 입력하면 자외선·이동을 함께 고려해요
        </p>
      </div>

      <Card variant="block">
        <p className="typo-caption text-text-tertiary">
          직접 입력한 일정만 수정·삭제할 수 있어요. 캘린더에서 가져온 일정은 읽기 전용이에요.
        </p>
      </Card>

      {isEdit && (
        <Button
          variant="secondary"
          onClick={handleDelete}
          disabled={isDeleting}
          className="border-danger text-danger w-full py-4"
        >
          일정 삭제
        </Button>
      )}

      <BottomCTA
        label="저장"
        disabled={!isValid || isCreating || isUpdating}
        onClick={handleSubmit}
      />
    </div>
  );
}

/**
 * 일정 직접 입력 — 추가·수정 공용 화면.
 * 담당: 윤서
 *
 * 로딩·에러만 여기서 걸러내고, 실제 폼은 데이터가 준비된 뒤에만 마운트한다.
 */
export default function ScheduleFormPage() {
  const { scheduleId } = useParams();
  const isEdit = Boolean(scheduleId);

  const { data, isLoading, isError } = useSchedule(scheduleId);

  if (isEdit && isLoading) {
    return (
      <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
        <NavHeader title="일정 수정" />
        <div className="flex flex-col gap-2.5" aria-busy="true">
          <div className="bg-surface-raised rounded-card h-14 animate-pulse" />
          <div className="bg-surface-raised rounded-card h-14 animate-pulse" />
          <div className="bg-surface-raised rounded-card h-14 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isEdit && isError) {
    return (
      <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
        <NavHeader title="일정 수정" />
        <p className="typo-body text-text-secondary">일정을 불러오지 못했어요.</p>
      </div>
    );
  }

  return <ScheduleFormFields scheduleId={scheduleId} isEdit={isEdit} initialSchedule={data} />;
}
