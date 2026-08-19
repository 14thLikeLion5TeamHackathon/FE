/**
 * 서버가 준 파일 경로를 브라우저가 받을 수 있는 주소로 바꾼다.
 *
 * 업로드 사진은 `/uploads/<uuid>.png`처럼 **상대경로**로 온다. 로컬에서는 vite 프록시가
 * 받아주지만(vite.config.ts) 배포본에는 프록시가 없다. 그대로 두면 요청이 우리 도메인으로 가고
 * Vercel이 SPA 폴백 HTML을 200으로 돌려줘서 **기록 사진이 전부 깨진다** — 실제로 겪은 사고다.
 *
 * 그래서 절대 주소가 아닌 경로에만 API 주소를 붙인다. 로컬처럼 `VITE_API_BASE_URL`이 비어 있으면
 * 상대경로 그대로가 맞다 — 프록시를 타야 하기 때문이다.
 */
const API_BASE: string = import.meta.env.VITE_API_BASE_URL ?? '';

/** 이미 완성된 주소인지. 프로토콜 상대(`//host/...`)와 data·blob도 건드리면 안 된다 */
function isAbsolute(path: string): boolean {
  return /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(path);
}

export function mediaUrl(path: string): string;
export function mediaUrl(path: string | null | undefined): string | undefined;
export function mediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (isAbsolute(path) || !API_BASE) return path;
  return `${API_BASE.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}
