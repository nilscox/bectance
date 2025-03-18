import EventEmitter from 'node:events';

export interface EventMap {
  shoppingListItemCreated: {
    id: string;
    shoppingListId: string;
    productId: string;
    quantity: number | undefined;
    checked: boolean;
  };

  shoppingListItemUpdated: {
    id: string;
    quantity?: number | null;
    checked?: boolean;
  };
}

const events = new EventEmitter();

export function emitDomainEvent<Event extends keyof EventMap>(name: Event, payload: EventMap[Event]) {
  events.emit(name, payload);
}

export function addDomainEventListener<Event extends keyof EventMap>(
  name: Event,
  cb: (payload: EventMap[Event]) => void,
) {
  events.addListener(name, cb);
}
