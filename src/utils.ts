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
