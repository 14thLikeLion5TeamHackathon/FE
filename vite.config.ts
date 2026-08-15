import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // dev에서 API를 프록시해 브라우저 관점 same-origin으로 만든다.
  // BE가 우리 dev 오리진을 CORS로 허용하지 않아서(포트가 바뀌면 특히) 직접 호출은 막힌다.
  //
  // 켜는 법: .env에 VITE_API_PROXY_TARGET=<서버 오리진>을 넣고 VITE_API_BASE_URL은 비운다.
  // baseURL이 비면 axios가 상대경로로 요청하고, 그 요청이 이 프록시를 탄다.
  // 서버 주소를 여기 적지 않는 이유는 이 파일이 공개 레포에 커밋되기 때문이다.
  const target = env.VITE_API_PROXY_TARGET;

  return {
    plugins: [react(), tailwindcss()],
    server: target
      ? {
          proxy: {
            '/api': {
              target,
              changeOrigin: true,
              cookieDomainRewrite: { '*': '' },
              // 서버의 CORS 허용 목록에 우리 dev 포트가 아직 없어서, 그대로 넘기면
              // 403 "Invalid CORS request"가 난다. 프록시가 대신 허용된 오리진을 달아 보낸다.
              // 브라우저 관점에선 same-origin이라 이 값이 실제로 검사되는 곳은 서버뿐이다.
              headers: { Origin: 'http://localhost:3000' },
            },
          },
        }
      : undefined,
  };
});
