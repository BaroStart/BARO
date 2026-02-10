import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const proxyTarget = env.VITE_API_URL || 'http://localhost:3000';

  // 공통 프록시 설정
  const baseProxy = {
    target: proxyTarget,
    changeOrigin: true,
    secure: false,
    configure: (proxy: any) => {
      proxy.on('proxyReq', (proxyReq: any) => {
        proxyReq.removeHeader('origin');
        proxyReq.removeHeader('referer');
      });
    },
  };

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['react', 'react-dom'],
    },
    server: {
      proxy: {
        '/api': baseProxy,
        // /mentor API 프록시
        '/mentor': {
          ...baseProxy,
          bypass: (req: any) => (req.headers.accept?.includes('text/html') ? req.url : undefined),
        },
      },
    },
  };
});
