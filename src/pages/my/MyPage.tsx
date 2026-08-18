import { useNavigate } from 'react-router';

import Card from '../../components/Card';
import PageHeader from '../../components/PageHeader';
import { useCalendarStatus, useDisconnectCalendar } from '../../hooks/calendar/useCalendar';
import { useDeleteAccount, useDisconnectKakao, useLogout, useMyProfile } from '../../hooks/user/useUser';
import { clearAccessToken } from '../../api/token';
import { GENDER_LABEL, type Gender } from '../../types/user';
import SettingRow from './components/SettingRow';

/** 섹션 제목 + 카드 한 덩어리 */
function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="typo-section text-text-secondary">{label}</h2>
      {children}
    </section>
  );
}

/** 프로필이 미완성인지 판별 (핵심 필드가 null이면 미완성) */
function isProfileIncomplete(data: { name: string | null; birthDate: string | null; gender: string | null }) {
  return !data.name || !data.birthDate || !data.gender;
}

export default function MyPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useMyProfile();
  const { mutate: doLogout } = useLogout();
  const { mutate: doDeleteAccount } = useDeleteAccount();
  const { mutate: doDisconnectKakao } = useDisconnectKakao();
  const { data: calendarConnected } = useCalendarStatus();
  const { mutate: doDisconnectCalendar } = useDisconnectCalendar();

  if (isLoading) {
    return (
      <div className="px-5 pt-5" aria-busy="true">
        <div className="bg-surface-raised rounded-card h-20 animate-pulse" />
      </div>
    );
  }

  if (isError || !data) {
    if (import.meta.env.DEV) {
      console.warn('[MyPage] 프로필 조회 실패 — isError:', isError, 'data:', data);
    }
    return (
      <div className="px-5 pt-5">
        <p className="typo-body text-text-secondary">정보를 불러오지 못했어요.</p>
      </div>
    );
  }

  // 미완성 프로필이면 가입 완료로 유도
  if (isProfileIncomplete(data)) {
    if (import.meta.env.DEV) {
      console.warn('[MyPage] 미완성 프로필 감지:', data);
    }
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5">
        <p className="typo-card-title text-text-primary">가입을 마저 완료해주세요</p>
        <p className="typo-body text-text-secondary text-center">
          서비스를 이용하려면 기본 정보 입력이 필요해요.
        </p>
        <button
          type="button"
          onClick={() => navigate('/signup', { replace: true })}
          className="bg-primary text-primary-on typo-label rounded-btn px-6 py-3"
        >
          정보 입력하기
        </button>
      </div>
    );
  }

  const genderLabel = GENDER_LABEL[data.gender as Gender] ?? data.gender;

  const handleLogout = () => {
    doLogout(undefined, {
      onSuccess: () => {
        clearAccessToken();
        navigate('/login', { replace: true });
      },
    });
  };

  const handleDeleteAccount = () => {
    if (!window.confirm('정말 탈퇴하시겠어요? 이 작업은 되돌릴 수 없습니다.')) return;
    doDeleteAccount(undefined, {
      onSuccess: () => {
        clearAccessToken();
        navigate('/login', { replace: true });
      },
    });
  };

  const handleDisconnectKakao = () => {
    if (!window.confirm('카카오 알림 연동을 해제하시겠어요?')) return;
    doDisconnectKakao();
  };

  const handleDisconnectCalendar = () => {
    if (!window.confirm('구글 캘린더 연동을 해제하시겠어요?')) return;
    doDisconnectCalendar();
  };

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      <PageHeader title="마이" />

      {/* 프로필 요약 */}
      <Card className="flex items-center gap-3">
        <div className="bg-surface-elevated size-11 shrink-0 rounded-full" aria-hidden />
        <div>
          <p className="typo-card-title">{data.name}</p>
          <p className="typo-caption text-text-secondary mt-1">
            {data.birthDate} · {genderLabel}
          </p>
        </div>
      </Card>

      {/* 개인정보 */}
      <Group label="개인정보">
        <Card variant="list">
          <SettingRow label="이름" value={data.name ?? ''} />
          <SettingRow label="생년월일" value={data.birthDate ?? ''} />
          <SettingRow label="성별" value={genderLabel} />
          <SettingRow label="개인정보 수정" onClick={() => navigate('/my/edit')} chevron />
        </Card>
      </Group>

      {/* 외부 연동 */}
      <Group label="연동">
        <Card variant="list">
          {/*
            연동 시작은 아직 없다 — 구글 인가 코드가 필요한데 FE용 client_id가 아직 없다.
            그래서 미연동일 때는 해제 줄 대신 상태만 보여준다. 눌러도 아무 일 없는 줄을
            띄워두면 사용자는 고장으로 읽는다.
          */}
          {calendarConnected ? (
            <SettingRow label="구글 캘린더 연동 해제" onClick={handleDisconnectCalendar} chevron />
          ) : (
            <SettingRow label="구글 캘린더" value="연동 안 됨" />
          )}
          <SettingRow label="카카오톡 알림 연동 해제" onClick={handleDisconnectKakao} chevron />
        </Card>
      </Group>

      {/* 계정 */}
      <Group label="계정">
        <Card variant="list">
          <SettingRow label="로그아웃" onClick={handleLogout} chevron />
          <SettingRow label="회원탈퇴" tone="danger" onClick={handleDeleteAccount} chevron />
        </Card>
      </Group>
    </div>
  );
}
