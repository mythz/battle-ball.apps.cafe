import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'game-engine': [
            './src/game/GameEngine',
            './src/game/physics/PhysicsEngine',
            './src/game/rendering/Renderer'
          ]
        }
      }
    }
  }
});
