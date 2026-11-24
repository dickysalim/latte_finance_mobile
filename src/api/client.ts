import { API_URL } from './config';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
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
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
  });

  const text = await response.text();
  const data: unknown = text ? safeJsonParse(text) : undefined;

  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(data) ?? response.statusText, data);
  }
  return data as TResponse;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(data: unknown): string | undefined {
  if (typeof data === 'object' && data !== null && 'error' in data) {
    const { error } = data as { error: unknown };
    if (typeof error === 'string') return error;
  }
  return undefined;
}
