import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
        },
    },
    base: './',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: false,
        // Silence large chunk warnings (expected for Excalidraw / Mermaid / D3)
        chunkSizeWarningLimit: 4000,
    },
    server: {
        port: 5173,
        strictPort: true,
    },
    css: {
        postcss: './postcss.config.mjs',
    },
})
