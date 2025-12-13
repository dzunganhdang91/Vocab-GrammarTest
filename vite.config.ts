import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    return {
        // CRITICAL FIX FOR GITHUB PAGES DEPLOYMENT
        // Replace [YOUR_REPO_NAME] with the actual name of your GitHub repository
        base: '/Vocab-GrammarTest/', 
        
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        define: {
            // These lines keep your existing environment variable definitions
            'process.env.API_KEY': JSON.stringify(env.AIzaSyCZ_YP8R5WncC_zIq5DtBLv7vXuA64rPq4),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.AIzaSyCZ_YP8R5WncC_zIq5DtBLv7vXuA64rPq4)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
});