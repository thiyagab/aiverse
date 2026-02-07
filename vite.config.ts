import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.API_KEY ?? env.GEMINI_API_KEY ?? ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY ?? env.API_KEY ?? ''),
        'process.env.AI_PROVIDER': JSON.stringify(env.AI_PROVIDER ?? env.VITE_AI_PROVIDER ?? 'gemini'),
        'process.env.VITE_AI_PROVIDER': JSON.stringify(env.VITE_AI_PROVIDER ?? env.AI_PROVIDER ?? 'gemini'),
        'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY ?? '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
