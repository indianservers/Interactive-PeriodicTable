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
    include: ['plotly.js-dist-min'],
  },
  build: {
    manifest: true,
    rollupOptions: {output: {onlyExplicitManualChunks: true, manualChunks(id) {if (id.includes("node_modules/molstar/")) return "molstar";}}},
    commonjsOptions: {
      include: [/ketcher/, /raphael/, /node_modules/],
      transformMixedEsModules: true,
    },
    // Keep Mol* internals together without pulling shared dependencies into
    // that chunk, so viewers remain lazy and circular reexports stay safe.
  },
})
