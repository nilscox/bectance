export function assert(value: unknown, error = new Error('Assertion error')): asserts value {
  if (!value) {
    throw error;
  }
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
