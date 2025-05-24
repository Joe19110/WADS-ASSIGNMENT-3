import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    server: {
      proxy: {
        "/service": {
          target: "http://localhost:5000",
        },
      },
      historyApiFallback: true,
      rewrite: [
        { from: '^/user/activate.*', to: '/index.html' },
      ],
    },
    build: {
      outDir: "dist",
    },
    plugins: [react(), tailwindcss()],
  }
})
