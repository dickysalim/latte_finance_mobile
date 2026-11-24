import { ApiError } from '@/api';

export type FormProblem = {
  /** Message for the whole form (shown in a Notice). */
  message?: string;
  /** Field name to message, from a 422. */
  fields: Record<string, string>;
  code: string;
};

/**
 * Turn anything thrown by an API call into what a form shows.
 * The worker's message text is meant for the user, so it is shown as is,
 * except for cases where the app has better words (network, rate limit, unknown).
 */
export function toFormProblem(error: unknown): FormProblem {
  if (error instanceof ApiError) {
    if (error.code === 'network_error') {
      return { code: error.code, fields: {}, message: 'Could not reach the server. Check your connection and try again.' };
    }
    if (error.status === 429) {
      return { code: error.code, fields: {}, message: 'Too many attempts, please wait a minute.' };
    }
    if (error.status >= 500 || error.code === 'unknown_error') {
      return { code: error.code, fields: {}, message: 'Something went wrong on our side. Please try again.' };
    }
    if (error.fields && Object.keys(error.fields).length > 0) {
      return { code: error.code, fields: error.fields };
    }
    return { code: error.code, fields: {}, message: error.message };
  }
  return { code: 'unknown_error', fields: {}, message: 'Something went wrong. Please try again.' };
}
