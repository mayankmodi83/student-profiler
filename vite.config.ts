
import { webcrypto } from 'node:crypto';
// Fix: Import process from 'node:process' to get correct typings for process.cwd().
import process from 'node:process';

// Polyfill for Web Crypto API. Vite 5.x needs crypto.getRandomValues,
// which may not be available on the global scope in all Node.js versions.
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = webcrypto as any;
}

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: '/profiler/',
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.DEFAULT_SHEET': JSON.stringify(env.DEFAULT_SHEET)
    }
  }
})
