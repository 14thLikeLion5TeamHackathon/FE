import { useNavigate } from 'react-router';

import Card from '../../components/Card';
import PageHeader from '../../components/PageHeader';
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

export default function MyPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useMyProfile();
  const { mutate: doLogout } = useLogout();
  const { mutate: doDeleteAccount } = useDeleteAccount();
  const { mutate: doDisconnectKakao } = useDisconnectKakao();

  if (isLoading) {
    return (
      <div className="px-5 pt-5" aria-busy="true">
        <div className="bg-surface-raised rounded-card h-20 animate-pulse" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="px-5 pt-5">
        <p className="typo-body text-text-secondary">정보를 불러오지 못했어요.</p>
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
          <SettingRow label="이름" value={data.name} />
          <SettingRow label="생년월일" value={data.birthDate} />
          <SettingRow label="성별" value={genderLabel} />
        </Card>
      </Group>

      {/* 카카오 알림 */}
      <Group label="알림">
        <Card variant="list">
          <SettingRow
            label="카카오톡 알림 연동 해제"
            onClick={handleDisconnectKakao}
            chevron
          />
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
