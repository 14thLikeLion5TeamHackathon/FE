# FE

멋쟁이사자처럼 14기 5팀 해커톤 프론트엔드 레포지토리입니다.

## 기술 스택

| 구분      | 사용 기술                                                      |
| --------- | -------------------------------------------------------------- |
| UI        | React 19, TypeScript, Tailwind CSS 4, `clsx`, `tailwind-merge` |
| 라우팅    | React Router 8, 라우트 단위 lazy loading                       |
| 상태·통신 | TanStack Query, Axios, Zod                                     |
| 개발 환경 | Vite, MSW, ESLint, Prettier, pnpm                              |

## 실행 방법

```bash
pnpm install
pnpm dev
```

환경 변수는 `.env.example`을 복사해 `.env.local`로 만들어 사용합니다.

```bash
cp .env.example .env.local
```

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
└── mocks/        # 개발 환경 MSW 핸들러
```

### API 레이어 규칙

1. `api/axiosInstance.ts` — 요청 인터셉터에서 Bearer 토큰 주입, 응답 인터셉터에서 서버 에러를 `ApiError`로 정규화하고 401이면 토큰을 비웁니다. 컴포넌트는 axios 에러 형태를 몰라도 됩니다.
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
- 타이포는 `.typo-*` 유틸 클래스를 사용합니다.
- **컴포넌트에서 raw hex나 font-size 직접 지정 금지** — `text-primary`, `shadow-card`, `typo-head-2` 형태로만 씁니다.
- 조건부 클래스는 `src/lib/cn.ts`의 `cn()`을 사용합니다.

### MSW

BE 미배포 엔드포인트만 `src/mocks/handlers.ts`에 추가합니다. 배포되면 핸들러를 지워 실 API로 넘깁니다.
목에 없는 요청은 그대로 통과하며(`onUnhandledRequest: 'bypass'`), `import.meta.env.DEV` 가드가 있어 프로덕션 번들에는 포함되지 않습니다.

## 협업 흐름

1. GitHub Issue 생성
2. `dev` 브랜치에서 최신 코드 반영
3. `<type>/<이슈번호>` 형식으로 작업 브랜치 생성
4. 작업 후 커밋 및 push
5. `dev` 브랜치로 PR 생성
6. 최소 1명 이상 리뷰 후 merge
7. 배포 시점에만 `dev`에서 `main`으로 PR 생성

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

## Issue 라벨

`feature`, `bug`, `docs`, `chore`, `design`, `refactor`, `test`, `question`

## 작업 상태 관리

GitHub Issue와 PR로만 관리합니다. 이슈에 라벨과 담당자를 지정하고, PR 본문에서 `Refs`/`Closes`로 연결합니다.
