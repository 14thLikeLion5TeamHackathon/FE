import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router';

import RecordCardSheet from '../../components/RecordCardSheet';
import TabBar, { TAB_BAR_HEIGHT } from '../../components/TabBar';

/**
 * 탭 화면(오늘 · 회복 · 마이) 공통 레이아웃.
 * TabBar는 fixed라 문서 흐름에서 빠지므로, 콘텐츠 하단에 바 높이 + 세이프 에어리어만큼 패딩을 준다.
 *
 * 기록 시트를 여는 상태도 여기서 든다. TabBar가 탭 어디서나 떠 있으니
 * 시트도 특정 화면이 아니라 레이아웃에 붙어야 오늘·회복·마이 모두에서 같게 동작한다.
 */
export default function TabLayout() {
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div
      className="bg-surface-canvas mx-auto min-h-dvh w-full max-w-app"
      style={{ paddingBottom: `calc(${TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom))` }}
    >
      <Outlet />
      <TabBar onRecord={() => setSheetOpen(true)} />

      <RecordCardSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSelect={(cardId) => {
          setSheetOpen(false);
          navigate(`/records/new?cardId=${cardId}`);
        }}
      />
    </div>
  );
}
