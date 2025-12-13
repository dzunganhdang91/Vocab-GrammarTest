import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
<<<<<<< HEAD
    const env = loadEnv(mode, '.', '');

    return {
        // REQUIRED FIX: Sets the base path to your repository name
        base: '/Vocab-GrammarTest/', 
=======
    // 1. Load Environment Variables
    const env = loadEnv(mode, '.', '');

    return {
        // 2. REQUIRED FOR GITHUB PAGES DEPLOYMENT
        // Replace [YOUR_REPO_NAME] with the actual name of your GitHub repository (e.g., 'nagumo-test-app')
        base: '/[Vocab-GrammarTest]/', 
>>>>>>> ce304eaca8bec4db743f4f5acfc92d56752a7bf1
        
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        define: {
<<<<<<< HEAD
            // These lines keep your existing environment variable definitions
=======
            // NOTE: These API keys look like placeholders and shouldn't be hardcoded into public JS bundles, 
            // but we keep the structure as provided.
>>>>>>> ce304eaca8bec4db743f4f5acfc92d56752a7bf1
            'process.env.API_KEY': JSON.stringify(env.AIzaSyCZ_YP8R5WncC_zIq5DtBLv7vXuA64rPq4),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.AIzaSyCZ_YP8R5WncC_zIq5DtBLv7vXuA64rPq4)
        },
        resolve: {
            alias: {
<<<<<<< HEAD
=======
                // This resolves '@' to the project root directory
>>>>>>> ce304eaca8bec4db743f4f5acfc92d56752a7bf1
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
<<<<<<< HEAD
});
=======
});
>>>>>>> ce304eaca8bec4db743f4f5acfc92d56752a7bf1
