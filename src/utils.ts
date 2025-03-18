import { Table } from 'console-table-printer';
import { customAlphabet } from 'nanoid';

export const createId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

export function assert(value: unknown, error = new Error('Assertion error')): asserts value {
  if (!value) {
    throw error;
  }
}

export function hasProperty<K extends PropertyKey, V>(prop: K, value: V) {
  return (obj: Record<K, V>) => obj[prop] === value;
}

export function printTable(columns: string[], values: string[][]) {
  if (values.length === 0) {
    console.log('No data.');
    return;
  }

  const table = new Table({
    columns: columns.map((name) => ({ name })),
  });

  values.forEach((row) =>
    table.addRow(
      toObject(
        columns,
        (key) => key,
        (_, index) => row[index],
      ),
    ),
  );

  table.printTable();
}

export function toObject<T, K extends PropertyKey, V>(
  array: readonly T[],
  getKey: (item: T, index: number) => K,
  getValue: (item: T, index: number) => V,
): Record<K, V> {
  return array.reduce(
    (obj, item, index) => ({ ...obj, [getKey(item, index)]: getValue(item, index) }),
    {} as Record<K, V>,
  );
}
