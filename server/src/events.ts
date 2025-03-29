import EventEmitter from 'node:events';

import { DomainEvents } from '@boubouffe/shared/dtos';

const events = new EventEmitter();

export function emitDomainEvent<Event extends keyof DomainEvents>(name: Event, payload: DomainEvents[Event]) {
  events.emit(name, payload);
}

export function addDomainEventListener<Event extends keyof DomainEvents>(
  name: Event,
  cb: (payload: DomainEvents[Event]) => void,
) {
  events.addListener(name, cb);

  return {
    unsubscribe() {
      events.removeListener(name, cb);
    },
  };
}
