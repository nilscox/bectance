export function assert(value: unknown, error = new Error('Assertion error')): asserts value {
  if (!value) {
    throw error;
  }
}
