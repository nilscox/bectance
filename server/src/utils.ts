import { Request } from 'express';
import { customAlphabet } from 'nanoid';

export const createId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

export function assert(value: unknown, error = new Error('Assertion error')): asserts value {
  if (!value) {
    throw error;
  }
}

export function defined<T>(value: T | null | false | undefined, error?: Error): T {
  assert(value, error);
  return value;
}

export function hasProperty<K extends PropertyKey, V>(prop: K, value: V) {
  return (obj: Record<K, V>) => obj[prop] === value;
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

export function getQueryParam(req: Request, name: string): string | undefined {
  if (typeof req.query[name] === 'string') {
    return req.query[name];
  }
}
