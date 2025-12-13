import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 1. Load Environment Variables
    const env = loadEnv(mode, '.', '');

    return {
        // 2. REQUIRED FOR GITHUB PAGES DEPLOYMENT
        // Replace [YOUR_REPO_NAME] with the actual name of your GitHub repository (e.g., 'nagumo-test-app')
        base: '/[Vocab-GrammarTest]/', 
        
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        define: {
            // NOTE: These API keys look like placeholders and shouldn't be hardcoded into public JS bundles, 
            // but we keep the structure as provided.
            'process.env.API_KEY': JSON.stringify(env.AIzaSyCZ_YP8R5WncC_zIq5DtBLv7vXuA64rPq4),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.AIzaSyCZ_YP8R5WncC_zIq5DtBLv7vXuA64rPq4)
        },
        resolve: {
            alias: {
                // This resolves '@' to the project root directory
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
});
