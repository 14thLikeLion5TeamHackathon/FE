type PageHeaderProps = {
  title: string;
};

/** 탭 화면(오늘·회복·마이) 상단 헤더. 서브페이지는 NavHeader를 쓴다. */
export default function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <h1 className="typo-title">{title}</h1>
      {/* 프로필 이미지 자리. 에셋 확정 전까지 원형 플레이스홀더 */}
      <div className="bg-surface-elevated size-7 rounded-full" aria-hidden />
    </header>
  );
}
