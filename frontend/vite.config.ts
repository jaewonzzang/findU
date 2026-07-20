import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 배포(vercel.json rewrite)와 같은 구조를 로컬에서도 만든다.
    // 백엔드를 다른 오리진으로 직접 부르면 세션 쿠키가 서드파티가 되어 OAuth 로그인이 깨진다.
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_TARGET ?? 'http://localhost:8000',
        changeOrigin: false,
      },
    },
  },
})
