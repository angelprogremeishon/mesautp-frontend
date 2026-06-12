import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'MesaUTP',
                short_name: 'MesaUTP',
                description: 'Comida económica para la comunidad UTP Ate',
                theme_color: '#EA580C',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                icons: [
                    { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
                ],
            },
        }),
    ],
    resolve: {
        alias: { '@': path.resolve(__dirname, 'src') },
    },
    server: { port: 5173 },
});
