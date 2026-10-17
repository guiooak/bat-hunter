// Turns a Firebase collection (an object keyed by id) into an array sorted by `createdAt`.
export function buildArray<T extends { createdAt?: number }>(
  collection?: Record<string, T> | null,
  order: 'ASC' | 'DESC' = 'ASC'
): T[] {
  if (!collection || typeof collection !== 'object') return [];

  const sortMultiplier = order === 'ASC' ? 1 : -1;

  return Object.values(collection).sort(
    (a, b) => ((a.createdAt || 0) - (b.createdAt || 0)) * sortMultiplier
  );
}
