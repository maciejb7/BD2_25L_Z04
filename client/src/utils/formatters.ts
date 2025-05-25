export type TwoWayMap<T, U> = {
  to: (key: T) => U | undefined;
  from: (value: U) => T | undefined;
};

/**
 * Creates a two-way map from a given forward map.
 * @param forwardMap
 * @returns An object with `to` and `from` methods for bidirectional mapping.
 */
export function getTwoWayMap<T, U>(forwardMap: Map<T, U>): TwoWayMap<T, U> {
  const reverseMap = new Map<U, T>();

  for (const [key, value] of forwardMap.entries()) {
    reverseMap.set(value, key);
  }

  return {
    to: (key: T): U | undefined => forwardMap.get(key),
    from: (value: U): T | undefined => reverseMap.get(value),
  };
}

export type DateFormatter = {
  getYMD: () => string;
  getDMY: () => string;
};

/**
 * Creates a date formatter from a date string.
 * The formatter provides methods to get the date in "YYYY-MM-DD" and "DD-MM-YYYY" formats.
 * @param dateString
 * @returns A DateFormatter object or null if the date string is invalid.
 */
export function getDateFormatter(dateString: string): DateFormatter | null {
  if (!dateString) return null;

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return null;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return {
    getYMD: () => `${year}-${month}-${day}`,
    getDMY: () => `${day}-${month}-${year}`,
  };
}
