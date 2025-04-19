import { Index } from 'flexsearch';
import { createMemo } from 'solid-js';

export function createSearchIndex<T>(getItems: () => T[], itemToString: (item: T) => string) {
  const index = createMemo(() => {
    const index = new Index({
      tokenize: 'full',
    });

    getItems().forEach((item, idx) => {
      index.add(idx, itemToString(item));
    });

    return index;
  });

  return (query: string): T[] => {
    const items = getItems();
    const results = index().search(query, { suggest: true }) as number[];

    return results.map((id) => items[id]) as T[];
  };
}
