import { useEffect } from 'react';
import type { ReactNode } from 'react';

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  /** 스크린리더가 읽을 시트 이름 */
  label: string;
  children: ReactNode;
};

/**
 * 딤 + 바텀시트.
 * 시안에서 시트 자체에는 그림자가 없다 — 다크 배경이라 딤(62%)이 분리를 담당한다.
 */
export default function BottomSheet({ open, onClose, label, children }: BottomSheetProps) {
  // 시트가 열린 동안 뒤 화면이 스크롤되지 않게 막는다.
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* 딤 — 눌러서 닫기 */}
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="bg-surface-overlay max-w-app absolute bottom-0 left-1/2 w-full -translate-x-1/2 rounded-t-card px-5 pt-3"
        style={{ paddingBottom: `calc(28px + env(safe-area-inset-bottom))` }}
      >
        {/* 손잡이 */}
        <div className="bg-border-strong mx-auto mb-3.5 h-1 w-10 rounded-full" aria-hidden />
        {children}
      </div>
    </div>
  );
}
