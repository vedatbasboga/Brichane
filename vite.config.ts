/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // DDS (WebAssembly) modül biçiminde paketlenmeli.
  worker: { format: 'es' },
  // DDS işçisi (gömülü wasm) ve Firebase ~500 kB; ikisi de yalnızca gerektiğinde yüklenir.
  build: { chunkSizeWarningLimit: 600 },
  test: {
    include: ['src/**/*.test.ts'],
  },
})
