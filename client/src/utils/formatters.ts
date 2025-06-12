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

export interface DateFormatter {
  getDMY: () => string;
  getDMYWithTime: () => string;
}

/**
 * Creates a date formatter from a date string.
 * The formatter provides methods to get the date in "DD.MM.YYYY" format,
 * with or without time (HH:mm).
 * Uses Intl.DateTimeFormat for proper locale-safe formatting.
 * @param dateString
 * @returns A DateFormatter object or null if the date string is invalid.
 */
export function getDateFormatter(
  dateString: string | null,
): DateFormatter | null {
  if (!dateString) return null;

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return null;

  const dmyFormatter = new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return {
    getDMY: () => {
      return dmyFormatter.format(date);
    },
    getDMYWithTime: () => {
      const dmy = dmyFormatter.format(date);
      const time = timeFormatter.format(date);
      return `${dmy} ${time}`;
    },
  };
}
