/**
 * Names are stored lowercase. The app shows each word capitalised: the first
 * letter at the start, after a space or after a hyphen becomes uppercase.
 * Everything else stays as stored.
 *
 * Display only. Never send the result back to the worker.
 */
export function displayName(stored: string | null | undefined): string {
  if (!stored) return '';
  return stored.replace(/(^|[\s-])(\p{L})/gu, (_match, before: string, letter: string) => before + letter.toUpperCase());
}

/** "Alice's household" from the owner's stored name; empty when there is no owner. */
export function householdLabel(ownerName: string | null | undefined): string {
  const owner = displayName(ownerName);
  return owner ? `${owner}'s household` : '';
}
