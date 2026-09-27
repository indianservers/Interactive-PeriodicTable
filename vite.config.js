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
    manifest: true,
    commonjsOptions: {
      include: [/ketcher/, /raphael/, /node_modules/],
      transformMixedEsModules: true,
    },
    // Let Rollup keep dependency cycles together. Optional viewers are split at
    // their lazy route boundaries instead of manually separating vendor internals.
  },
})
