import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Where the Django dev server listens. Override with DJANGO_API_URL in .env
// if your backend runs on a different host/port.
const DEFAULT_BACKEND = 'http://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.DJANGO_API_URL || DEFAULT_BACKEND
  const proxy = {
    '/api': {
      target: backend,
      changeOrigin: true,
    },
  }

  return {
    plugins: [react()],
    server: {
      // "host: true" exposes the dev server on the LAN so the same UI can be
      // opened from a phone while /api/* keeps being proxied to Django.
      host: true,
      port: 5173,
      proxy,
    },
    preview: {
      host: true,
      port: 4173,
      proxy,
    },
  }
})
