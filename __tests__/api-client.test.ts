import { ApiError, apiPost } from '@/api';

function mockReply(status: number, body?: unknown, statusText = '') {
  const text = body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body);
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText,
    text: () => Promise.resolve(text),
  });
}

async function catchError(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);
    return error as ApiError;
  }
  throw new Error('expected apiPost to throw');
}

describe('apiPost', () => {
  const realFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it('POSTs JSON with a Bearer header and returns the parsed body', async () => {
    mockReply(200, { user_id: 'u1' });
    const result = await apiPost<{ user_id: string }>('/login', { email: 'alice@example.com' }, {
      accessToken: 'tok',
    });
    expect(result).toEqual({ user_id: 'u1' });
    const [url, init] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url.endsWith('/login')).toBe(true);
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer tok');
    expect(init.body).toBe(JSON.stringify({ email: 'alice@example.com' }));
  });

  it('sends no Authorization header without a token', async () => {
    mockReply(200, {});
    await apiPost('/login');
    expect((globalThis.fetch as jest.Mock).mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it('carries status, code, message and fields on a 422', async () => {
    mockReply(422, {
      error: {
        code: 'invalid_fields',
        message: 'Some fields are invalid',
        fields: { email: 'Enter a valid email' },
      },
    });
    const error = await catchError(apiPost('/normal-signup', {}));
    expect(error.status).toBe(422);
    expect(error.code).toBe('invalid_fields');
    expect(error.message).toBe('Some fields are invalid');
    expect(error.fields).toEqual({ email: 'Enter a valid email' });
    expect(error.isTokenExpired).toBe(false);
  });

  it('flags only a 401 token_expired as expired', async () => {
    mockReply(401, { error: { code: 'token_expired', message: 'Session expired' } });
    expect((await catchError(apiPost('/x'))).isTokenExpired).toBe(true);

    mockReply(401, { error: { code: 'token_invalid', message: 'Please log in' } });
    const invalid = await catchError(apiPost('/x'));
    expect(invalid.code).toBe('token_invalid');
    expect(invalid.isTokenExpired).toBe(false);
  });

  it('has no fields when the worker sends none', async () => {
    mockReply(409, { error: { code: 'profile_needed', message: 'Complete your profile' } });
    const error = await catchError(apiPost('/login'));
    expect(error.code).toBe('profile_needed');
    expect(error.fields).toBeUndefined();
  });

  it('falls back to unknown_error when the error body has an unexpected shape', async () => {
    mockReply(500, 'Internal Server Error', 'Server Error');
    const error = await catchError(apiPost('/x'));
    expect(error.status).toBe(500);
    expect(error.code).toBe('unknown_error');
    expect(error.message).toBe('Server Error');
  });

  it('maps a failed fetch to network_error', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const error = await catchError(apiPost('/x'));
    expect(error.status).toBe(0);
    expect(error.code).toBe('network_error');
  });
});

describe('ApiError details', () => {
  it('keeps error.details, for example the waiting invites', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: 'invites_waiting',
            message: 'You have waiting invites',
            details: { invites: [{ invite_id: 'i1' }] },
          },
        }),
        { status: 409 },
      ),
    );
    await expect(apiPost('/first-login-household')).rejects.toMatchObject({
      code: 'invites_waiting',
      details: { invites: [{ invite_id: 'i1' }] },
    });
  });
});
