import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/llm': {
            target: env.LLM_BASE_URL || process.env.LLM_BASE_URL,
            changeOrigin: true,
            secure: true,
            rewrite: (p) => p.replace(/^\/api\/llm/, '/v1'),
            headers: {
              Authorization: `Bearer ${env.LLM_API_KEY || process.env.LLM_API_KEY || ''}`
            }
          }
        }
      },
      plugins: [react()],
      assetsInclude: ['**/*.task'],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY),
        'process.env.LLM_BASE_URL': JSON.stringify(env.LLM_BASE_URL || process.env.LLM_BASE_URL),
        'process.env.LLM_API_KEY': JSON.stringify(env.LLM_API_KEY || process.env.LLM_API_KEY),
        'process.env.LLM_MODEL': JSON.stringify(env.LLM_MODEL || process.env.LLM_MODEL),
        'process.env.AMAP_KEY': JSON.stringify(env.AMAP_KEY || process.env.AMAP_KEY),
        'process.env.AMAP_SECURITY_CODE': JSON.stringify(env.AMAP_SECURITY_CODE || process.env.AMAP_SECURITY_CODE),
        'process.env.AMAP_SECRET': JSON.stringify(env.AMAP_SECRET || process.env.AMAP_SECRET)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
