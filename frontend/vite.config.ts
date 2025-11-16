// frontend/vite.config.ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // se quiser, pode usar env.VITE_API_URL aqui, mas com o proxy abaixo não é obrigatório.
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      // proxy para backend (dev). Assim qualquer requisição para /api/* será encaminhada ao backend 4000
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p, // mantém /api/...
        },
      },
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // agora @ aponta para src (mais comum)
      }
    }
  };
});
