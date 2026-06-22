import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis do .env para configurar o proxy.
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = env.VITE_API_BASE_URL || '/api'
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:3000'

  return {
    plugins: [react()],
    server: {
      // Redireciona as chamadas do frontend (apiBase) para o backend NestJS,
      // evitando problemas de CORS sem precisar alterar o backend.
      proxy: {
        [apiBase]: {
          target: backendUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${apiBase}`), ''),
        },
      },
    },
  }
})
