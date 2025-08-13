import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Ensure the commit SHA is available in client code. Prefer the explicitly set
    // VITE_COMMIT_SHA (from package.json build), otherwise fall back to Vercel's
    // auto-injected commit variable.
    'import.meta.env.VITE_COMMIT_SHA': JSON.stringify(
      process.env.VITE_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || ''
    ),
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
