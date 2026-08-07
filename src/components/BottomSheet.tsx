import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  /** 스크린리더가 읽을 시트 이름 */
  label: string;
  children: ReactNode;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * 딤 + 바텀시트.
 * 시안에서 시트 자체에는 그림자가 없다 — 다크 배경이라 딤(60%)이 분리를 담당한다.
 *
 * `aria-modal`을 선언한 이상 포커스도 실제로 가둬야 한다. 선언만 하고 동작이 없으면
 * 보조기기 사용자에게 거짓말이 된다.
 */
export default function BottomSheet({ open, onClose, label, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // onClose를 ref로 들고 있어야 effect가 open에만 의존한다.
  // 부모가 인라인 화살표 함수를 넘기면 매 렌더마다 effect가 다시 돌아 포커스를 뺏는다.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    const restoreTo = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sheetRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const sheet = sheetRef.current;
      if (!sheet) return;

      const items = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      restoreTo?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* 딤 — 눌러서 닫기. 키보드는 Escape로 닫으므로 탭 순서에서 뺀다. */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className="bg-surface-overlay max-w-app absolute bottom-0 left-1/2 w-full -translate-x-1/2 rounded-t-card px-5 pt-3 outline-none"
        style={{ paddingBottom: `calc(28px + env(safe-area-inset-bottom))` }}
      >
        {/* 손잡이 */}
        <div className="bg-border-strong mx-auto mb-3.5 h-1 w-10 rounded-full" aria-hidden />
        {children}
      </div>
    </div>
  );
}
