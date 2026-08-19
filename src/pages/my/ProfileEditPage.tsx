import { useState } from 'react';
import { useNavigate } from 'react-router';

import BottomCTA from '../../components/BottomCTA';
import DateField from '../../components/DateField';
import Field from '../../components/Field';
import NavHeader from '../../components/NavHeader';
import Segment from '../../components/Segment';
import { useMyProfile, useUpdateProfile } from '../../hooks/user/useUser';
import { fromDateInputValue, toDateInputValue } from '../../lib/date';
import { GENDER_LABEL, type Gender } from '../../types/user';
import SegmentGroup from '../auth/components/SegmentGroup';
import Skeleton from '../../components/Skeleton';

/**
 * 개인정보 수정 — 이름·생년월일·성별.
 *
 * 서버가 받는 필드가 이 셋뿐이다(`PUT /api/v1/mypage/users/me`). 약관 동의와
 * AAC 방문 경험은 수정 대상이 아니라 회원가입에서만 받는다.
 *
 * 값은 조회 응답으로 채운다. 서버는 생년월일을 하이픈("2007-05-17")으로 주는데
 * 화면 표준은 점("2007.05.17")이라 들어올 때와 나갈 때 양쪽에서 바꾼다 —
 * 회원가입도 같은 방식이다.
 */
export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useMyProfile();
  const { mutate: updateProfile, isPending, isError } = useUpdateProfile();

  /**
   * 조회 응답이 오기 전에는 빈 문자열로 두고, 오면 그때 한 번만 채운다.
   * `useState`의 초기값은 첫 렌더에만 쓰이므로 데이터가 늦게 와도 반영되지 않는다.
   */
  const [form, setForm] = useState<{
    name: string;
    birthDate: string;
    gender: Gender | null;
  } | null>(null);

  const filled = form ?? {
    name: data?.name ?? '',
    birthDate: data?.birthDate ? fromDateInputValue(data.birthDate) : '',
    gender: (data?.gender as Gender | null) ?? null,
  };

  const patch = (next: Partial<typeof filled>) => setForm({ ...filled, ...next });

  const isValid =
    filled.name.trim() !== '' && filled.birthDate.trim() !== '' && filled.gender !== null;

  const handleSubmit = () => {
    if (!isValid || filled.gender === null) return;

    updateProfile(
      {
        name: filled.name.trim(),
        birthDate: toDateInputValue(filled.birthDate),
        gender: filled.gender,
      },
      { onSuccess: () => navigate('/my', { replace: true }) },
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3.5 px-5 pt-5" aria-busy="true">
        <NavHeader title="개인정보 수정" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-5 pt-5 pb-28">
      <NavHeader title="개인정보 수정" />

      <div className="flex flex-col gap-2">
        <label htmlFor="profile-name" className="typo-label text-text-primary">
          이름 <span className="text-primary">*</span>
        </label>
        <Field
          id="profile-name"
          placeholder="이름을 입력해주세요"
          value={filled.name}
          onChange={(e) => patch({ name: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="typo-label text-text-primary">
          생년월일 <span className="text-primary">*</span>
        </p>
        <DateField value={filled.birthDate} onChange={(value) => patch({ birthDate: value })} />
      </div>

      <SegmentGroup label="성별">
        {(Object.keys(GENDER_LABEL) as Gender[]).map((value) => (
          <Segment
            key={value}
            selected={filled.gender === value}
            onClick={() => patch({ gender: value })}
          >
            {GENDER_LABEL[value]}
          </Segment>
        ))}
      </SegmentGroup>

      {/* 실패했는데 화면이 그대로면 사용자는 버튼이 안 먹은 줄 안다 */}
      {isError && (
        <p className="typo-caption text-danger">수정에 실패했어요. 잠시 후 다시 시도해주세요.</p>
      )}

      <BottomCTA
        label={isPending ? '저장 중...' : '저장하기'}
        disabled={!isValid || isPending}
        onClick={handleSubmit}
      />
    </div>
  );
}
