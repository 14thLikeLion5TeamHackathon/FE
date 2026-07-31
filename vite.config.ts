import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // BE가 쿠키 기반 세션(SameSite=Lax)을 쓰면 아래 프록시를 켤 것.
  // cross-site XHR에는 Lax 쿠키가 실리지 않아서, dev에서 /api를 운영 서버로 프록시해
  // 브라우저 관점 same-origin으로 만들어야 로컬에서 세션이 붙는다.
  // (axios baseURL을 비워 상대경로로 두면 이 프록시를 탄다. 운영 빌드는 VITE_API_BASE_URL로 직접 호출.)
  //
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'https://api.example.com',
  //       changeOrigin: true,
  //       secure: true,
  //       cookieDomainRewrite: { '*': '' }, // Set-Cookie 도메인 제거 → localhost host-only 쿠키로 저장
  //     },
  //   },
  // },
});
