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
import { useDeleteAccount, useDisconnectKakao, useMyProfile } from '../../hooks/user/useUser';
// 로그아웃은 auth 쪽 훅을 쓴다 — 서버 호출 성패와 무관하게 토큰과 쿼리 캐시까지 비운다.
import { useLogout } from '../../hooks/auth/useAuth';
import { useKakaoStatus, useUpdateKakaoConsent } from '../../hooks/notification/useNotification';
import { clearAccessToken } from '../../api/token';
import { socialProviderLabel } from '../../lib/socialProvider';
import { GENDER_LABEL, type Gender } from '../../types/user';
import SettingRow from './components/SettingRow';
import Skeleton from '../../components/Skeleton';

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
  // 진행 상태·실패 여부를 화면에서 읽어야 해서 mutate만 꺼내지 않는다
  const disconnectKakao = useDisconnectKakao();
  const { data: calendarConnected } = useCalendarStatus();
  const disconnectCalendar = useDisconnectCalendar();
  // undefined = "꺼짐"이 아니라 "모름"이다 (조회 API가 없다 — hooks/notification 참고)
  const { data: kakaoStatus, isError: kakaoStatusFailed } = useKakaoStatus();
  const updateKakaoConsent = useUpdateKakaoConsent();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3.5 px-5 pt-5" aria-busy="true">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-20" />
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
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

  /** 로그인에 쓴 소셜 제공자. 서버가 안 알려줘서 로그인 직전에 적어 둔 값이다 */
  const providerLabel = socialProviderLabel();

  /**
   * 로그아웃.
   *
   * `onSuccess`가 아니라 `onSettled`다. 서버 호출이 실패해도 — 네트워크가 끊겼거나,
   * 토큰이 이미 만료돼 401이 나거나 — 로그아웃 버튼을 눌렀으면 로그아웃이 돼야 한다.
   * 성공했을 때만 내보내면 그 경우 로그인 상태로 남아 버튼이 안 먹은 것처럼 보인다.
   *
   * 토큰 삭제와 캐시 비우기는 `useLogout`이 자기 `onSettled`에서 한다 — 여기서 또 부르면
   * 로그아웃 경로가 두 군데로 갈라져 한쪽만 고치는 사고가 난다.
   */
  const handleLogout = () => {
    doLogout(undefined, {
      onSettled: () => navigate('/login', { replace: true }),
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

  /**
   * 카카오 알림 **연동 해제**(DELETE). 수신 on/off와 다르다 — 다시 켜려면 동의 화면을 거쳐야 한다.
   *
   * 요청이 날아가는 동안 행을 잠근다. 연타하면 같은 DELETE가 두 번 나가고, 첫 요청이
   * 연동을 지운 뒤라 두 번째는 404가 된다 — 해제는 됐는데 화면은 실패로 보인다.
   */
  const handleDisconnectKakao = () => {
    if (disconnectKakao.isPending) return;
    if (!window.confirm('카카오 알림 연동을 해제하시겠어요?')) return;
    disconnectKakao.mutate();
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

  /**
   * 조회가 끝나기 전에는 연동 여부를 단정하지 않는다.
   * 조회가 실패한 경우는 "모름"이 아니라 "확인 불가"로 따로 본다 — 그때까지 스위치를
   * 잠가 두면 연동을 시작할 길 자체가 막힌다. 동의 화면은 보낼 수 있게 열어 둔다.
   */
  const kakaoStatusKnown = kakaoStatus !== undefined;
  const kakaoConnected = kakaoStatus?.connected === true;
  const kakaoReceiving = kakaoConnected && kakaoStatus?.consent === true;

  /*
    카카오는 "연동"과 "수신 동의"가 다른 개념이라 토글이 무엇을 뜻하는지 정해야 했다.
    토글 = 수신 on/off(PATCH consent)로 둔다. 매번 껐다 켤 때마다 동의 화면을 왕복시키는
    건 과하고, PATCH는 연결을 살려둔 채 수신만 바꾼다. 연동을 통째로 끊는 DELETE는
    되돌리려면 재동의가 필요한 무거운 동작이라 아래 별도 행으로 남긴다.

    연동이 아직 없을 때 켜기는 PATCH가 아니라 동의 화면으로 보낸다 —
    붙을 연동이 없으면 서버가 404를 낸다. 상태를 모르는 동안은 스위치를 잠가 둔다.
  */
  const handleKakaoToggle = (next: boolean) => {
    if (next) {
      if (kakaoConnected) {
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

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      <PageHeader title="마이" />

      {/* 프로필 요약 */}
      <Card className="flex items-center gap-3">
        {/*
          프로필 사진 자리였는데 계약에 이미지 필드가 없다. 빈 원을 그대로 두면
          "아직 안 불러온 사진"으로 읽혀서, 이름 첫 글자로 채운다 —
          이름은 프로필이 완성된 사용자에게 항상 있다(위 isProfileIncomplete 가드).
        */}
        <div
          className="bg-primary-tint text-primary typo-card-title flex size-11 shrink-0 items-center justify-center rounded-full"
          aria-hidden
        >
          {data.name?.trim().charAt(0) ?? ''}
        </div>
        <div>
          {/* 생년월일·성별은 바로 아래 개인정보 목록에 있다 — 여기서 또 쓰면 같은 걸 두 번 읽는다 */}
          <p className="typo-card-title">{data.name}</p>
          {/*
            어느 소셜로 들어왔는지. 별도 행이 아니라 이름 아래에 붙인다 —
            한 번 보고 마는 정보라 목록에 자리를 차지할 이유가 없다.

            모르면 아예 감춘다. 저장소를 지웠거나 다른 기기에서 로그인했으면 알 방법이
            없는데, 추측해서 적으면 틀린 계정을 알려주게 된다(lib/socialProvider.ts).
          */}
          {providerLabel && (
            <p className="typo-caption text-text-tertiary mt-1">{providerLabel} 로그인</p>
          )}
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
                ? '일정을 불러와 오늘 브리핑에 써요. 끄면 연동이 해제돼요'
                : googleConfigured
                  ? '켜면 구글 동의 화면으로 이동해요'
                  : '연동 키가 없어 지금은 켤 수 없어요'
            }
            action={
              <Switch
                label="구글 캘린더 연동"
                checked={isCalendarConnected}
                disabled={
                  disconnectCalendar.isPending || (!isCalendarConnected && !googleConfigured)
                }
                onChange={handleCalendarToggle}
              />
            }
          />

          {/*
            조회가 실패했을 때도 스위치는 꺼진 모양이지만, 설명에서 "모른다"고 분명히 말한다.
            꺼짐으로 단정해 "연동 안 됨"이라고 쓰면 이미 연동한 사람에게 거짓말이 된다.
          */}
          <SettingRow
            label="카카오톡 알림"
            description={
              kakaoStatusFailed
                ? '연동 상태를 확인할 수 없어요. 켜면 카카오 동의 화면으로 이동해요'
                : !kakaoStatusKnown
                  ? '연동 상태를 확인하고 있어요'
                  : kakaoReceiving
                    ? '알림을 받고 있어요'
                    : kakaoConnected
                      ? '수신을 꺼뒀어요. 다시 켜면 바로 받아요'
                      : kakaoConfigured
                        ? '켜면 카카오 동의 화면으로 이동해요'
                        : '연동 키가 없어 지금은 켤 수 없어요'
            }
            action={
              <Switch
                label="카카오톡 알림 수신"
                checked={kakaoReceiving}
                disabled={
                  updateKakaoConsent.isPending ||
                  (!kakaoStatusKnown && !kakaoStatusFailed) ||
                  (!kakaoConnected && !kakaoConfigured)
                }
                onChange={handleKakaoToggle}
              />
            }
          />

          {/*
            연동이 있다고 확인된 뒤에만 보여준다 — 연동한 적 없는 사람에게 해제를 권하지 않는다.

            실패하면 행에 남아 말한다. 토스트가 없어서 이 자리 말고는 알릴 데가 없고,
            아무 말도 안 하면 사용자는 눌렀는데 아무 일도 안 일어난 것으로 본다 —
            연동은 그대로인데 해제된 줄 알고 떠나는 쪽이 더 나쁘다.
          */}
          {kakaoConnected && (
            <SettingRow
              label="카카오톡 알림 연동 해제"
              description={
                disconnectKakao.isPending
                  ? '해제하고 있어요'
                  : disconnectKakao.isError
                    ? '해제하지 못했어요. 잠시 후 다시 시도해주세요'
                    : undefined
              }
              onClick={handleDisconnectKakao}
              disabled={disconnectKakao.isPending}
              chevron
            />
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
