import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';
  return {
    base: isBuild ? './' : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'react': path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      entries: ['index.html'],
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'lucide-react',
        'motion/react',
        'leaflet',
        'canvas-confetti',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/storage',
      ],
      esbuildOptions: {
        target: 'es2020',
      },
    },
    build: {
      target: 'es2020',
      minify: 'esbuild',
      cssMinify: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('leaflet')) {
                return 'vendor-leaflet';
              }
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
              if (id.includes('firebase/storage')) {
                return 'vendor-firebase-storage';
              }
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('canvas-confetti')) {
                return 'vendor-confetti';
              }
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                return 'vendor-react';
              }
            }
          },
        },
      },
    },
    server: {
      hmr: false,
      watch: null,
    },
  };
});
