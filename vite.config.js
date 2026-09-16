import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': JSON.stringify({
      PUBLIC_URL: '',
      NODE_ENV: process.env.NODE_ENV || 'development',
    }),
  },
  optimizeDeps: {
    include: ['ketcher-core', 'ketcher-react', 'ketcher-standalone', 'plotly.js-dist-min'],
  },
  build: {
    commonjsOptions: {
      include: [/ketcher/, /raphael/, /node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/molstar/') || id.includes('\\node_modules\\molstar\\')) return 'molstar';
          if (id.includes('ketcher')) return 'ketcher';
          if (id.includes('plotly')) return 'plotly';
        },
      },
    },
  },
})
