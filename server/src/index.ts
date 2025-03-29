import 'dotenv/config';

import { app } from './app.js';
import { config } from './config.js';
import { addDomainEventListener } from './events.js';

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

const events = ['shoppingListItemCreated', 'shoppingListItemUpdated'] as const;

for (const event of events) {
  addDomainEventListener(event, (payload: unknown) => console.log(event, payload));
}
