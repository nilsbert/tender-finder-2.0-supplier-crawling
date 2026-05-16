import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    base: '/ms/supplier-crawling/',
    plugins: [react()],
    build: {
        outDir: 'dist_new',
    },
    resolve: {
        alias: [
            {
                find: /^@porsche-design-system\/components-react$/,
                replacement: path.resolve(__dirname, 'src/pds-wrapper.tsx')
            }
        ]
    },
    server: {
        port: 8011, // Dedicated UI port for Crawling MS
        proxy: {
            '/api': {
                target: 'http://localhost:8001',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
            }
        }
    }
});
