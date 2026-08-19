import logoUrl from '../assets/logo.png';
import { cn } from '../lib/cn';

/**
 * 서비스 로고 — 심볼 마크 + 한글 워드마크.
 *
 * 심볼은 팀이 만든 대나무 마디 캐릭터다(Figma `1043:1897`). **벡터가 아니라 PNG다** —
 * 원본이 이미지로 생성된 그림이라 시안에 벡터 레이어가 없다. 그래서 인라인 SVG가 아니라
 * `src/assets/logo.png`를 임포트해 쓴다. 나중에 SVG 원본이 나오면 여기만 갈아끼우면 된다.
 *
 * 세로로 긴 그림(가로:세로 ≈ 3:5)이라 크기를 **높이로 받는다.** 폭을 기준으로 잡으면
 * 헤더에서 로고만 아래로 삐져나온다.
 *
 * 워드마크는 path로 뽑지 않고 Pretendard 텍스트를 그대로 쓴다(굵기 700 = typo-title).
 */
type LogoProps = {
  /** 심볼 마크 **높이** px. 워드마크는 typo-title 고정이라 같이 커지지 않는다. */
  size?: number;
  /** 심볼만 보여준다. 자리가 좁은 곳(탭바·작은 헤더)에서 쓴다. */
  symbolOnly?: boolean;
  className?: string;
};

export default function Logo({ size = 24, symbolOnly = false, className }: LogoProps) {
  return (
    // 워드마크가 이미지가 아니라 텍스트라 스크린리더가 "마디"를 두 번 읽지 않도록
    // 묶음 전체를 하나의 이미지로 선언하고, 안쪽 img는 감춘다.
    <span
      role="img"
      aria-label="마디"
      className={cn('text-text-primary inline-flex items-center gap-1.5', className)}
    >
      <img
        src={logoUrl}
        alt=""
        aria-hidden
        // 원본 비율 306:512. width를 비워두면 로드 전에 높이가 0이라 옆 글자가 밀린다.
        height={size}
        width={Math.round((size * 306) / 512)}
        className="shrink-0"
      />
      {!symbolOnly && <span className="typo-title">마디</span>}
    </span>
  );
}
