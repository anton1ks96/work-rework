import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  console.log('Vite Config Loaded')
  console.log('API_BASE_URL:', env.API_BASE_URL)

  return {
    plugins: [react()],
    server: {
      port: 5172,
      strictPort: false,
      open: true 
    },
    define: {
      'import.meta.env.API_BASE_URL': JSON.stringify(env.API_BASE_URL)
    }
  }
})
