import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/web-ifc-three/node_modules/web-ifc/*.wasm',
          dest: 'wasm'
        }
      ]
    })
  ].filter(Boolean),
  optimizeDeps: {
    exclude: ['web-ifc']
  },
  worker: {
    format: 'es'
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
