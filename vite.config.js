import { defineConfig } from 'vite';

export default defineConfig({
  root: './',         // raiz do projeto
  base: '/stardust/', // GitHub Pages path: https://criselias-dev.github.io/stardust/
  build: {
    outDir: 'dist',   // pasta de build final
    rollupOptions: {
      input: './index.html'
    }
  },
  server: {
    open: true,       // abre o navegador automaticamente
    host: '0.0.0.0',  // aceita conexões locais e evita HMR host mismatch
    port: 5173,       // porta padrão do Vite
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  }
});