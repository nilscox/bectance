import tailwindcss from '@tailwindcss/vite';
import { HttpProxy, defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin(), tailwindcss()],
  server: {
    port: 8000,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: configureApiProxy,
      },
    },
  },
  build: {
    target: 'esnext',
  },
});

function configureApiProxy(proxy: HttpProxy.Server) {
  // https://github.com/vitejs/vite/issues/13522#issuecomment-1598482702
  proxy.on('proxyReq', (proxyReq, req, res) => {
    res.on('close', () => {
      if (!res.writableEnded) {
        proxyReq.destroy();
      }
    });
  });
}
