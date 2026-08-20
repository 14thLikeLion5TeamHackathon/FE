# 마디 (Madi)

시술 후 회복을 하루 단위로 안내하는 웹 앱입니다. 멋쟁이사자처럼 14기 5팀 해커톤 프론트엔드 레포지토리입니다.

시술을 받고 나면 "오늘은 뭘 조심해야 하지"가 매일 생깁니다. 마디는 받은 시술을 **케어 카드**로 등록해 두면
D-day와 그날의 날씨·자외선·미세먼지를 함께 보고 오늘 할 관리를 한 줄로 알려줍니다.

**배포 주소**: https://madi-eta.vercel.app (`main` 브랜치가 프로덕션입니다)

## 주요 기능

| 화면      | 기능                                                                                                                                                                  |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 로그인    | 카카오·구글 소셜 로그인(BE 리다이렉트 방식), 온보딩에서 약관 동의와 기본 정보 입력                                                                                    |
| 오늘      | 날짜별 관리 브리핑, 오늘의 케어 체크리스트, 날씨·자외선·미세먼지, 일정 직접 입력과 구글 캘린더 일정, 기준 위치 변경(GPS 또는 17개 광역시도), 브리핑·체크리스트 재생성 |
| 회복      | 케어 카드 목록과 회복 진행률, 두 시점 사진 비교와 증상 추이 곡선                                                                                                      |
| 카드 상세 | D-day 진행바, 오늘의 관리, 회복 가이드 구간, 주의사항, 회복 기록 타임라인                                                                                             |
| 기록      | 사진·증상 강도·메모로 회복 기록 등록, 등록 직후 AI 피드백과 지난 기록 비교                                                                                            |
| 마이      | 개인정보 조회·수정, 로그인한 소셜 계정 표시, 구글 캘린더·카카오톡 알림 연동(연동된 구글 계정 표시), 로그아웃·회원탈퇴                                                 |

## 기술 스택

| 구분      | 사용 기술                                                      |
| --------- | -------------------------------------------------------------- |
| UI        | React 19, TypeScript, Tailwind CSS 4, `clsx`, `tailwind-merge` |
| 라우팅    | React Router 8, 라우트 단위 lazy loading                       |
| 상태·통신 | TanStack Query, Axios, Zod                                     |
| 개발 환경 | Vite, ESLint, Prettier, pnpm                                   |

## 실행 방법

```bash
pnpm install
pnpm dev
```

환경 변수는 `.env.example`을 복사해 만들고, 각 값의 의미와 발급처는 그 파일 주석에 적혀 있습니다.

```bash
cp .env.example .env
```

서버 주소와 키는 공개 레포에 올리지 않습니다 — 팀 노션에서 받아 `.env`에만 넣습니다.
로컬에서는 `VITE_API_BASE_URL`을 비우고 `VITE_API_PROXY_TARGET`에 서버 오리진을 넣어 vite 프록시로 붙습니다(CORS 우회).

## 배포

`main` 브랜치가 프로덕션입니다. `main`에 커밋이 올라가면 Vercel이 프로덕션 배포를 만들고,
다른 브랜치와 PR은 Preview 배포로 붙습니다.

SPA라 새로고침이나 직접 진입에서 404가 나지 않도록 `vercel.json`이 전 경로를 `index.html`로
rewrite합니다. 라우팅은 브라우저에서 React Router가 합니다.

## 도입하지 않은 것

의도적으로 뺀 것들입니다. 필요해지면 넣되, 지금 없는 이유를 남겨 둡니다.

- **상태 관리 라이브러리** — 서버 상태는 TanStack Query가, 화면 상태는 `useState`가, localStorage와 묶인 값은 `useSyncExternalStore`가 맡습니다(`api/token.ts`, `lib/scheduleDates.ts`). 전역으로 공유할 클라이언트 상태가 사실상 없어서 Redux·Zustand를 넣을 이유가 없었습니다.
- **테스트 프레임워크** — 해커톤 기간에 시연 경로를 먼저 뚫었습니다. 대신 `pnpm build`가 `tsc -b`로 타입을 검사하고, API 경계는 Zod가 런타임에 막습니다.
- **PWA(서비스워커)** — 홈 화면 설치는 매력적이지만, 서비스워커가 한번 캐시를 깔면 배포해도 옛 화면이 남을 수 있습니다. 시연 중에 그 자리에서 대처할 방법이 없어 넣지 않았습니다.

## 자주 사용하는 명령어

```bash
pnpm dev      # 개발 서버 실행
pnpm lint     # 코드 규칙 검사
pnpm build    # 타입 검사 + 프로덕션 빌드
pnpm format   # Prettier 기준 포맷 정리
```

PR 올리기 전에 `pnpm lint`와 `pnpm build`를 확인합니다.

## 프로젝트 구조

```text
src/
├── app/          # 라우팅과 앱 레이아웃
├── components/   # 공용 UI (도메인 지식 없음)
├── pages/        # 화면 단위 기능
├── api/          # Axios 기반 API 호출과 공통 응답 처리
├── hooks/        # TanStack Query 도메인 훅
├── types/        # Zod 스키마와 API 타입
└── lib/          # 프레임워크 무관 유틸 (cn, 날짜, 위치 등)
```

### API 레이어 규칙

1. `api/axiosInstance.ts` — 요청 인터셉터에서 Bearer 토큰 주입, 응답 인터셉터에서 서버 에러를 `ApiError`로 정규화합니다. 컴포넌트는 axios 에러 형태를 몰라도 됩니다.

   **401은 곧바로 로그아웃이 아닙니다.** 토큰을 갱신해 그 요청을 한 번 다시 보내고, 갱신이 401·403으로 거절될 때만 토큰을 비우고 로그인으로 보냅니다. 네트워크 장애로 갱신이 실패한 경우는 멀쩡한 리프레시 토큰을 지킵니다 — 그때 지우면 재로그인을 강요하게 됩니다. 같은 순간에 몰린 401들은 갱신을 한 번만 부르도록 묶습니다(단일 비행).

2. `api/helpers.ts`의 `getResult()` — 공통 응답 봉투에서 `result`만 꺼냅니다. 모든 API 함수가 이걸 통과합니다.
3. 도메인 API 함수는 **Zod `.parse()`로 끝냅니다.** 스키마가 곧 타입이라 BE 계약이 바뀌면 런타임에서 바로 드러납니다.

```ts
export async function getHome(): Promise<HomeResponse> {
  const res = await axiosInstance.get<ApiResponse>('/home');
  return HomeResponse.parse(getResult(res));
}
```

훅은 `src/hooks/<도메인>/use<도메인>.ts`에 그 도메인의 쿼리·뮤테이션을 모읍니다.

### 스타일 규칙

- 색·radius·shadow·font는 `src/index.css`의 `@theme` 토큰으로만 정의합니다.
  토큰 이름은 Figma `Wireframe` 변수와 1:1이라 **코드에서 임의로 바꾸지 않습니다** — 시안이 먼저 바뀌고 코드가 따라갑니다.
- **다크 테마 전용**입니다. 라이트 모드 대응은 하지 않습니다.
- 타이포는 `.typo-*` 유틸 6종만 씁니다 — `typo-title` `typo-card-title` `typo-section` `typo-body` `typo-label` `typo-caption`
- **컴포넌트에서 raw hex나 font-size 직접 지정 금지** — `bg-surface-raised`, `text-text-secondary`, `typo-card-title` 형태로만 씁니다.
- 조건부 클래스는 `src/lib/cn.ts`의 `cn()`을 사용합니다.

> ⚠️ `text-primary`는 **글자색이 아니라 스카이(`#8DC9F7`)** 입니다. 본문 글자는 `text-text-primary`입니다.

전체 토큰 목록과 자주 하는 실수는 [디자인 토큰 치트시트](https://app.notion.com/p/3b437e6b127e81bfb1eaed6601d61d6f)에 있습니다.

## 협업 흐름

1. GitHub Issue 생성
2. `dev` 브랜치에서 최신 코드 반영
3. `<type>/<이슈번호>` 형식으로 작업 브랜치 생성
4. 작업 후 커밋 및 push
5. `dev` 브랜치로 PR 생성
6. 최소 1명 이상 리뷰 후 merge
7. 배포 시점에만 `dev`에서 `main`으로 PR 생성 — `main`에 올라가면 Vercel이 프로덕션으로 배포합니다

```bash
git checkout dev
git pull origin dev
git checkout -b feature/12
```

## 브랜치 전략

- `main`: 배포 가능한 안정 버전
- `dev`: 개발 통합 브랜치
- `<type>/<이슈번호>`: 작업 브랜치

허용 type: `feature`, `fix`, `chore`, `design`, `docs`, `refactor`, `test`

예시:

- `feature/12`
- `fix/15`
- `chore/21`

잘못된 예시:

- `feature/12-login-page`
- `hotfix/12`
- `feature/login`

`main`과 `dev`에는 직접 push하지 않습니다.

## 커밋 컨벤션

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 스타일 변경
- `refactor`: 리팩터링
- `chore`: 설정/기타 작업
- `design`: UI 디자인/레이아웃 변경

```bash
git commit -m "feat: 로그인 페이지 구현 (#12)"
```

## PR 규칙

- 작업 브랜치에서 `dev`로 PR 생성
- 제목은 `type: 내용` 형식 (CI가 검사)
- 본문에 `## 작업 내용`, `## 관련 이슈`, `## 확인 사항` 섹션 필수 (CI가 검사)
- 본문에 `Refs #12` 또는 `Closes #12`로 이슈 연결
- 최소 1명 이상 리뷰 후 merge
- merge 전 `pnpm lint`, `pnpm build` 확인

이슈를 자동으로 닫으려면 `Closes #12`를 사용합니다. `dev`로 머지될 때 닫힙니다.

## GitHub 보호 규칙

기본 브랜치는 `dev`입니다. PR을 열면 base가 자동으로 `dev`로 잡힙니다.

`main`과 `dev`에 아래 규칙이 걸려 있습니다.

- 직접 push 불가 — PR로만 반영
- 승인 리뷰 1명 이상 필요
- CI 3종(`lint-and-build`, `check-branch-name`, `check-pr-template`) 통과 필수
- force push와 브랜치 삭제 차단
- merge 전 base 브랜치 최신 상태 반영 필요

머지 버튼이 비활성화되면 대부분 아래 둘 중 하나입니다.

- CI가 실패했거나 아직 실행 중
- `dev`가 그 사이 업데이트되어 브랜치를 최신화해야 하는 경우

두 번째는 이렇게 해결합니다.

```bash
git checkout feature/12
git fetch origin
git merge origin/dev
git push
```

레포 admin은 위 규칙을 우회할 수 있습니다. CI 설정 자체가 깨져 모든 PR이 막히는 상황을 풀기 위한 예외이며, 평상시에는 admin도 PR로 작업합니다.

## Issue 라벨

`feature`, `bug`, `docs`, `chore`, `design`, `refactor`, `test`, `question`

## 작업 상태 관리

GitHub Issue와 PR로만 관리합니다. 이슈에 라벨과 담당자를 지정하고, PR 본문에서 `Refs`/`Closes`로 연결합니다.
