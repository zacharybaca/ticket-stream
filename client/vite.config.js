import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Render-friendly Vite config
export default defineConfig({
  base: '/', // Ensure correct asset paths in production
  plugins: [react(),
  ],
  server: {
    port: 5173,
    // --- ADD THIS PROXY SECTION ---
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Your Express Backend Port
        changeOrigin: true,
        secure: false,
      },
    },
    // ------------------------------
    mimeTypes: {
      webmanifest: 'application/manifest+json',
    }
  },
  build: {
    outDir: 'dist',          // Where Render will serve from
    assetsDir: 'assets',     // Folder for static assets
    sourcemap: true,         // Debugging production errors
    minify: 'esbuild',       // Fast and small builds
    rollupOptions: {
      output: {
        manualChunks: undefined // Avoid splitting into excessive chunks
      }
    }
  }
})
