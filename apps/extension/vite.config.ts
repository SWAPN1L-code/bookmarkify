import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                popup: path.resolve(__dirname, 'index.html'),
                background: path.resolve(__dirname, 'src/background.ts'),
            },
            output: {
                entryFileNames: 'src/[name].js',
                chunkFileNames: 'assets/[name].[hash].js',
                assetFileNames: 'assets/[name].[hash].[ext]',
            },
        },
    },
    server: {
        port: 5174,
    },
});
