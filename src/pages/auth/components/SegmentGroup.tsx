import type { ReactNode } from 'react';

type SegmentGroupProps = {
  label: string;
  children: ReactNode;
};

/** 라벨 + Segment 두 개를 가로로 감싸는 자리. 성별·방문 경험에서 쓴다. */
export default function SegmentGroup({ label, children }: SegmentGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="typo-label text-text-primary">{label}</p>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}
