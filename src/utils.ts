import { customAlphabet } from 'nanoid';

export const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

export function assert(value: unknown, error = new Error('Assertion error')): asserts value {
  if (!value) {
    throw error;
  }
}
