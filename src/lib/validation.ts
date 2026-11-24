/**
 * The same checks the worker runs (api_contracts, convention: validation), so a form can answer
 * before the request. The worker still has the last word: its 422 messages are shown as they come.
 * Callers clean the value first (trim, lowercase email and username), as the worker does.
 */
export const validation = {
  email(value: string): string | undefined {
    const ok = /^[^@\s]+@[^@\s]+$/.test(value) && value.length <= 254;
    return ok ? undefined : 'Enter a valid email';
  },
  username(value: string): string | undefined {
    const ok = value.length >= 3 && value.length <= 30 && !/[\s@]/.test(value);
    return ok ? undefined : '3 to 30 characters, no spaces or @';
  },
  name(value: string): string | undefined {
    return value.length >= 1 && value.length <= 100 ? undefined : 'Enter your name (up to 100 characters)';
  },
  password(value: string): string | undefined {
    return value.length >= 8 && value.length <= 128 ? undefined : '8 to 128 characters';
  },
};

export function clean(value: string): string {
  return value.trim().toLowerCase();
}

export type FieldErrors<K extends string> = Partial<Record<K, string>>;
