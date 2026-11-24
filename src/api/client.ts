import { API_URL } from './config';

/** Field name to message, sent by the worker on 422 only. */
export type ApiErrorFields = Record<string, string>;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    /** Stable snake_case name to switch on, for example `token_expired`. */
    public readonly code: string,
    message: string,
    public readonly fields?: ApiErrorFields,
    /** Extra data next to code and message, for example `{ invites: [...] }` on invites_waiting. */
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** The only 401 that should trigger one /refresh call and a retry. */
  get isTokenExpired(): boolean {
    return this.status === 401 && this.code === 'token_expired';
  }
}

type RequestOptions = {
  accessToken?: string;
  signal?: AbortSignal;
};

/** POST JSON to a worker route such as `/login`. Throws ApiError on a non-2xx reply. */
export async function apiPost<TResponse>(
  path: string,
  body: Record<string, unknown> = {},
  { accessToken, signal }: RequestOptions = {},
): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new ApiError(0, 'network_error', 'Could not reach the server');
  }

  const text = await response.text();
  const data: unknown = text ? safeJsonParse(text) : undefined;

  if (!response.ok) throw toApiError(response, data);
  return data as TResponse;
}

function toApiError(response: Response, data: unknown): ApiError {
  const error = isRecord(data) && isRecord(data.error) ? data.error : undefined;
  const code = typeof error?.code === 'string' ? error.code : 'unknown_error';
  const message =
    typeof error?.message === 'string' ? error.message : response.statusText || 'Request failed';
  return new ApiError(
    response.status,
    code,
    message,
    toFields(error?.fields),
    isRecord(error?.details) ? error.details : undefined,
  );
}

function toFields(value: unknown): ApiErrorFields | undefined {
  if (!isRecord(value)) return undefined;
  const fields: ApiErrorFields = {};
  for (const [name, message] of Object.entries(value)) {
    if (typeof message === 'string') fields[name] = message;
  }
  return fields;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
