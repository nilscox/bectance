import express from 'express';

import { config } from './config';

const app = express();

const { host, port } = config.server;

const server = app.listen(port, host, () => {
  console.debug(`Server listening on ${host}:${port}`);
});

process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);

function closeServer(signal: string) {
  console.debug(`${signal} signal received, closing server`);

  server.close(() => {
    console.debug('Server closed');
  });
}
