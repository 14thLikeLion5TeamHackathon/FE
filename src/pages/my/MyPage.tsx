import Card from '../../components/Card';
import PageHeader from '../../components/PageHeader';
import Switch from '../../components/Switch';
import { useMyProfile, useUpdateNotifications } from '../../hooks/user/useUser';
import { GENDER_LABEL, type NotificationSettings } from '../../types/user';
import SettingRow from './components/SettingRow';

/**
 * ─────────────────────────────────────────────────────────────
 * 레퍼런스 화면 — 다른 화면도 이 구조를 따라가면 된다.
 *
 * 1. 데이터는 훅 한 줄로만 가져온다. axios·Zod·쿼리 키는 화면이 모른다.
 * 2. 로딩/에러를 먼저 처리하고 그다음 본문을 그린다.
 * 3. 색·타이포는 토큰 클래스로만. raw hex와 font-size 직접 지정 금지.
 * 4. Content는 시안 규격 고정 — padding 20/20/24/20, 블록 간격 14(gap-3.5).
 * ─────────────────────────────────────────────────────────────
 */

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
  const { data, isLoading, isError } = useMyProfile();
  const { mutate: saveNotifications } = useUpdateNotifications();

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

  const { notifications } = data;

  /** 토글 하나만 바꿔서 통째로 저장한다. all을 끄면 하위는 화면에서 비활성. */
  const toggle = (key: keyof NotificationSettings) => (checked: boolean) => {
    saveNotifications({ ...notifications, [key]: checked });
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
            {data.birthDate} · {GENDER_LABEL[data.gender]}
          </p>
        </div>
      </Card>

      <Group label="개인정보">
        <Card variant="list">
          <SettingRow label="이름" value={data.name} href onClick={() => {}} />
          <SettingRow label="생년월일" value={data.birthDate} href onClick={() => {}} />
          <SettingRow label="성별" value={GENDER_LABEL[data.gender]} href onClick={() => {}} />
        </Card>
      </Group>

      <Group label="연동 서비스">
        <Card variant="list">
          <SettingRow
            label="Google 캘린더"
            value={data.calendarEmail ?? '연동 안 됨'}
            href
            onClick={() => {}}
          />
          <SettingRow label="계정 변경" href onClick={() => {}} />
          <SettingRow label="연동 해제" href onClick={() => {}} />
        </Card>
      </Group>

      <Group label="알림">
        {/* 마스터와 개별을 카드로 분리해 종속 관계를 드러낸다 */}
        <Card variant="list">
          <SettingRow
            label="카카오톡 알림 받기"
            action={
              <Switch
                label="카카오톡 알림 받기"
                checked={notifications.all}
                onChange={toggle('all')}
              />
            }
          />
        </Card>

        <p className="typo-caption text-text-tertiary">
          카카오톡 알림 받기를 끄면 아래 알림이 모두 중단돼요
        </p>

        <Card variant="list">
          <SettingRow
            label="오늘의 케어 안내"
            description="매일 아침 그 날의 관리 행동을 보내드려요"
            action={
              <Switch
                label="오늘의 케어 안내"
                checked={notifications.dailyCare}
                onChange={toggle('dailyCare')}
                disabled={!notifications.all}
              />
            }
          />
          <SettingRow
            label="기록 리마인드"
            description="D+3·D+7 등 주요 시점에 기록을 안내해요"
            action={
              <Switch
                label="기록 리마인드"
                checked={notifications.recordReminder}
                onChange={toggle('recordReminder')}
                disabled={!notifications.all}
              />
            }
          />
          <SettingRow
            label="사전 경고"
            description="전날 밤 위험한 일정이 있으면 미리 알려드려요"
            action={
              <Switch
                label="사전 경고"
                checked={notifications.preWarning}
                onChange={toggle('preWarning')}
                disabled={!notifications.all}
              />
            }
          />
        </Card>
      </Group>

      <Group label="계정">
        <Card variant="list">
          <SettingRow label="로그아웃" href onClick={() => {}} />
          <SettingRow label="회원탈퇴" tone="danger" href onClick={() => {}} />
        </Card>
      </Group>
    </div>
  );
}
