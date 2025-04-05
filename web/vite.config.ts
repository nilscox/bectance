import fs from 'node:fs/promises';
import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import devtools from 'solid-devtools/vite';
import { HttpProxy, Plugin, defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [devtools(), solid(), tailwindcss(), copyFile({ src: 'index.html', dest: '404.html' })],
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

type CopyFileOptions = {
  src: string;
  dest: string;
};

function copyFile({ src, dest }: CopyFileOptions): Plugin {
  let dist = '';

  return {
    name: 'outputFile',
    configResolved(config) {
      dist = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      await fs.copyFile(path.join(dist, src), path.join(dist, dest));
    },
  };
}
