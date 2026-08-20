import type { SocialProvider } from '../api/oauth';

/**
 * 어느 소셜 계정으로 로그인했는지.
 *
 * **서버가 알려주지 않는다.** 로그인은 BE 리다이렉트 방식이라 돌아올 때 실리는 건
 * 토큰과 `isNewUser`뿐이고(api/oauth.ts), `MyProfile`에도 제공자 필드가 없다.
 * 그래서 동의 화면으로 떠나기 직전에 우리가 적어 둔다 — 같은 오리진이라 돌아와도 남는다.
 *
 * **모르는 상태가 정상적으로 존재한다.** 저장소를 지웠거나 다른 기기에서 로그인했거나
 * DEV 건너뛰기로 들어온 경우다. 그때는 추측하지 말고 아무것도 보여주지 않는다 —
 * 틀린 제공자를 적어두면 "카카오로 가입한 줄 알았는데" 같은 혼란만 만든다.
 */
const STORAGE_KEY = 'social-provider';

const LABEL: Record<SocialProvider, string> = {
  kakao: '카카오',
  google: 'Google',
};

export function rememberSocialProvider(provider: SocialProvider): void {
  try {
    localStorage.setItem(STORAGE_KEY, provider);
  } catch {
    // 사파리 프라이빗 모드 등에서 막힐 수 있다. 로그인 자체를 막을 이유는 없다.
  }
}

export function getSocialProvider(): SocialProvider | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === 'kakao' || raw === 'google' ? raw : null;
  } catch {
    return null;
  }
}

export function clearSocialProvider(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 지우지 못해도 다음 로그인 때 덮어써진다
  }
}

/** 화면에 쓸 이름. 모르면 null이라 호출부가 행 자체를 감출 수 있다 */
export function socialProviderLabel(): string | null {
  const provider = getSocialProvider();
  return provider ? LABEL[provider] : null;
}
