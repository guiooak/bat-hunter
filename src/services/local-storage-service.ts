type ValidLocalStorageKeysType = 'bh-background-music-muted' | 'bh-difficulty';

export function getLocalStorageValue(key: ValidLocalStorageKeysType) {
  try {
    return JSON.parse(localStorage.getItem(key) as string);
  } catch {
    return null;
  }
}

export function setLocalStorageValue(
  key: ValidLocalStorageKeysType,
  value: unknown
) {
  const stringfiedValue = JSON.stringify(value);
  localStorage.setItem(key, stringfiedValue);
}
