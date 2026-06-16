export function indexBy(items, key) {
  return new Map(items.map((item) => [item[key], item]));
}
