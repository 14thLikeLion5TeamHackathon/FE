import { useNavigate } from 'react-router';

import Card from '../../components/Card';
import PageHeader from '../../components/PageHeader';
import Switch from '../../components/Switch';
import { useCalendarStatus, useDisconnectCalendar } from '../../hooks/calendar/useCalendar';
import {
  isConnectConfigured,
  startGoogleCalendarConnect,
  startKakaoNotificationConnect,
} from '../../lib/connect';
import { useDeleteAccount, useDisconnectKakao, useLogout, useMyProfile } from '../../hooks/user/useUser';
import { useKakaoConsent, useUpdateKakaoConsent } from '../../hooks/notification/useNotification';
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

/**
 * 프로필이 미완성인지 판별 (핵심 필드가 비어 있으면 미완성).
 *
 * 값이 `null`(서버가 빈 값이라고 알려줌)이든 `undefined`(키 자체가 안 옴)든 똑같이 미완성이다 —
 * 스펙상 `UserInfoResponse`에 required가 하나도 없어서 두 경우가 다 온다.
 */
function isProfileIncomplete(data: {
  name?: string | null;
  birthDate?: string | null;
  gender?: string | null;
}) {
  return !data.name || !data.birthDate || !data.gender;
}

export default function MyPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useMyProfile();
  const { mutate: doLogout } = useLogout();
  const { mutate: doDeleteAccount } = useDeleteAccount();
  const { mutate: doDisconnectKakao } = useDisconnectKakao();
  const { data: calendarConnected } = useCalendarStatus();
  const disconnectCalendar = useDisconnectCalendar();
  // undefined = "꺼짐"이 아니라 "모름"이다 (조회 API가 없다 — hooks/notification 참고)
  const { data: kakaoConsent } = useKakaoConsent();
  const updateKakaoConsent = useUpdateKakaoConsent();

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

  /*
    토글의 켜기와 끄기는 대칭이 아니다.
    켜기는 제공자 동의 화면으로 페이지를 떠나므로 낙관적 표시를 할 자리가 없고,
    끄기는 서버 mutation이라 확인을 받는다. 취소하면 mutate를 부르지 않을 뿐이고,
    화면은 서버 상태(쿼리)만 보므로 스위치가 저절로 제자리로 돌아온다 —
    로컬 state를 두면 그 자리에서 서버와 어긋난다.
  */
  const handleCalendarToggle = (next: boolean) => {
    if (next) {
      startGoogleCalendarConnect();
      return;
    }
    if (!window.confirm('구글 캘린더 연동을 해제하시겠어요?')) return;
    disconnectCalendar.mutate();
  };

  /*
    카카오는 "연동"과 "수신 동의"가 다른 개념이라 토글이 무엇을 뜻하는지 정해야 했다.
    토글 = 수신 on/off(PATCH consent)로 둔다. 매번 껐다 켤 때마다 동의 화면을 왕복시키는
    건 과하고, PATCH는 연결을 살려둔 채 수신만 바꾼다. 연동을 통째로 끊는 DELETE는
    되돌리려면 재동의가 필요한 무거운 동작이라 아래 별도 행으로 남긴다.

    상태를 모를 때(첫 진입) 켜기는 PATCH가 아니라 동의 화면으로 보낸다 —
    연동이 아직 없을 수 있고, 그때 PATCH는 붙을 곳이 없다.
  */
  const handleKakaoToggle = (next: boolean) => {
    if (next) {
      if (kakaoConsent === false) {
        updateKakaoConsent.mutate(true); // 연동은 살아 있고 수신만 꺼둔 상태
        return;
      }
      startKakaoNotificationConnect();
      return;
    }
    if (!window.confirm('카카오톡 알림 수신을 끄시겠어요?')) return;
    updateKakaoConsent.mutate(false);
  };

  const googleConfigured = isConnectConfigured('google');
  const kakaoConfigured = isConnectConfigured('kakao');
  const isCalendarConnected = calendarConnected ?? false;
  /** 이번 접속에서 카카오 수신 상태를 실제로 확인했는지 */
  const kakaoStatusKnown = kakaoConsent !== undefined;

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
            키가 없어도 행을 감추지 않는다 — 감추면 왜 없는지 알 수 없다.
            스위치만 잠가서 "있지만 지금은 켤 수 없다"를 그대로 보여준다.
          */}
          <SettingRow
            label="구글 캘린더"
            description={
              isCalendarConnected
                ? '일정을 불러와 오늘 브리핑에 씁니다'
                : googleConfigured
                  ? '켜면 구글 동의 화면으로 이동해요'
                  : '연동 키가 없어 지금은 켤 수 없어요'
            }
            action={
              <Switch
                label="구글 캘린더 연동"
                checked={isCalendarConnected}
                disabled={disconnectCalendar.isPending || (!isCalendarConnected && !googleConfigured)}
                onChange={handleCalendarToggle}
              />
            }
          />

          {/*
            상태를 모를 때도 스위치는 꺼진 모양이지만, 설명에서 "모른다"고 분명히 말한다.
            꺼짐으로 단정해 "연동 안 됨"이라고 쓰면 이미 연동한 사람에게 거짓말이 된다.
            비활성으로 두는 안도 검토했지만 그러면 연동 자체를 시작할 길이 막힌다.
          */}
          <SettingRow
            label="카카오톡 알림"
            description={
              kakaoConsent === true
                ? '알림을 받고 있어요'
                : kakaoConsent === false
                  ? '수신을 꺼뒀어요. 다시 켜면 바로 받아요'
                  : kakaoConfigured
                    ? '연동 상태를 확인할 수 없어요. 켜면 카카오 동의 화면으로 이동해요'
                    : '연동 키가 없어 지금은 켤 수 없어요'
            }
            action={
              <Switch
                label="카카오톡 알림 수신"
                checked={kakaoConsent === true}
                disabled={updateKakaoConsent.isPending || (!kakaoStatusKnown && !kakaoConfigured)}
                onChange={handleKakaoToggle}
              />
            }
          />

          {/* 연동이 있다고 확인된 뒤에만 보여준다 — 연동한 적 없는 사람에게 해제를 권하지 않는다 */}
          {kakaoStatusKnown && (
            <SettingRow label="카카오톡 알림 연동 해제" onClick={handleDisconnectKakao} chevron />
          )}
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
