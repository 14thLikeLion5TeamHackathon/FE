import { cn } from '../lib/cn';
import { formatDateDisplay, fromDateInputValue, toDateInputValue } from '../lib/date';

type DateFieldProps = {
  /** 앱 표준 포맷 "YYYY.MM.DD". 값이 없으면 '' */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** 화면 낭독기용 이름. 라벨이 별도 문단이라 입력과 연결돼 있지 않아 직접 준다 */
  label?: string;
  className?: string;
};

/**
 * 날짜 입력 — 네이티브 달력 선택기를 그대로 쓴다.
 * 값은 앱 표준 포맷 "YYYY.MM.DD"로 주고받고, 화면에는 요일을 붙여 보여준다.
 * `Field`와 마찬가지로 입력칸만 담당한다 — 라벨·필수 마커는 쓰는 쪽 화면에서 그린다.
 *
 * **진짜 입력을 투명하게 덮어 놓는다.** 예전에는 입력을 `sr-only`로 숨기고 버튼을 눌러
 * `showPicker()`를 부르는 구조였는데, iOS Safari는 화면에 렌더되지 않은 입력에는 피커를
 * 열어주지 않고, `showPicker()`가 없거나 예외를 던질 때의 폴백(`focus()`)도 숨긴 입력에는
 * 아무 효과가 없다. 그래서 일부 기기에서 **아무 반응 없이 먹통**이 됐다.
 *
 * 지금은 입력 자체가 터치 영역이라 브라우저가 알아서 연다 — JS 지원 여부와 무관하다.
 * 보이는 부분은 `pointer-events-none`이라 탭이 그대로 밑의 입력으로 내려간다.
 */
export default function DateField({
  value,
  onChange,
  placeholder = 'YYYY.MM.DD',
  label = '날짜 선택',
  className,
}: DateFieldProps) {
  return (
    <div className={cn('relative', className)}>
      {/*
        보이는 상자보다 **먼저** 와야 한다 — 뒤따르는 형제에게만 걸리는 `peer-*`로
        포커스 표시를 넘기기 때문이다. 입력이 투명해 포커스가 보이지 않는 걸 이걸로 메운다.

        `appearance-none`이 없으면 사파리가 자체 UI를 그려 높이가 어긋난다.
        `opacity-0`이지 `hidden`이 아니다 — 숨기는 순간 위 주석의 문제가 되돌아온다.
      */}
      <input
        type="date"
        aria-label={label}
        value={value ? toDateInputValue(value) : ''}
        onChange={(e) => onChange(e.target.value ? fromDateInputValue(e.target.value) : '')}
        className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
      />

      <div
        className={cn(
          'typo-body rounded-md bg-surface-raised flex w-full items-center border p-3.5 pl-10 text-left transition-colors',
          'peer-focus-visible:outline-primary peer-focus-visible:outline-2',
          value ? 'border-primary border-[1.5px]' : 'border-border-subtle',
          // 클릭이 이 상자에 막히면 안 된다 — 밑의 입력이 받아야 피커가 열린다
          'pointer-events-none',
        )}
      >
        <svg
          viewBox="0 0 16 16"
          className="text-text-tertiary absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2"
          fill="none"
          aria-hidden
        >
          <rect
            x="2"
            y="3"
            width="12"
            height="11"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M2 6.5H14M5 1.5V3.5M11 1.5V3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        {value ? (
          <span className="text-text-primary">{formatDateDisplay(value)}</span>
        ) : (
          <span className="text-text-tertiary">{placeholder}</span>
        )}
      </div>
    </div>
  );
}
