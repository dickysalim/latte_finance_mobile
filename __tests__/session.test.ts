import { ApiError } from '@/api/client';
import {
  authedPost,
  clearSession,
  refreshSession,
  restoreSession,
  setSessionEndedListener,
  startSession,
} from '@/api/session';

const store: Record<string, string> = {};
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (k: string) => store[k] ?? null),
  setItemAsync: jest.fn(async (k: string, v: string) => {
    store[k] = v;
  }),
  deleteItemAsync: jest.fn(async (k: string) => {
    delete store[k];
  }),
}));

function reply(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status });
}
const expired = () => reply(401, { error: { code: 'token_expired', message: 'Token expired' } });
const invalid = () => reply(401, { error: { code: 'token_invalid', message: 'Token invalid' } });
const tokens = (n: number) => ({ access_token: `access-${n}`, refresh_token: `refresh-${n}` });

let fetchMock: jest.Mock;
let ended: jest.Mock;

beforeEach(async () => {
  fetchMock = jest.fn();
  globalThis.fetch = fetchMock;
  ended = jest.fn();
  setSessionEndedListener(ended);
  await clearSession();
  ended.mockClear();
  await startSession(tokens(1));
});

const calls = () => fetchMock.mock.calls.map(([url]) => String(url).replace(/^.*(?=\/[a-z-]+$)/, ''));
const bearer = (i: number) => (fetchMock.mock.calls[i][1].headers as Record<string, string>).Authorization;

describe('authedPost', () => {
  it('sends the access token', async () => {
    fetchMock.mockResolvedValueOnce(reply(200, { ok: true }));
    await authedPost('/me');
    expect(bearer(0)).toBe('Bearer access-1');
  });

  it('on token_expired calls /refresh once, then retries with the new token', async () => {
    fetchMock
      .mockResolvedValueOnce(expired())
      .mockResolvedValueOnce(reply(200, tokens(2)))
      .mockResolvedValueOnce(reply(200, { id: 'u1' }));
    await expect(authedPost('/me')).resolves.toEqual({ id: 'u1' });
    expect(calls()).toEqual(['/me', '/refresh', '/me']);
    expect(bearer(2)).toBe('Bearer access-2');
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ refresh_token: 'refresh-1' });
  });

  it('keeps only the newest refresh token on the device', async () => {
    fetchMock.mockResolvedValueOnce(expired()).mockResolvedValueOnce(reply(200, tokens(2))).mockResolvedValueOnce(reply(200, {}));
    await authedPost('/me');
    expect(await restoreSession()).toBe(true);
    fetchMock.mockResolvedValueOnce(reply(200, tokens(3)));
    await refreshSession();
    expect(JSON.parse(fetchMock.mock.calls[3][1].body)).toEqual({ refresh_token: 'refresh-2' });
  });

  it('any other 401 goes to login and does not refresh', async () => {
    fetchMock.mockResolvedValueOnce(invalid());
    await expect(authedPost('/me')).rejects.toBeInstanceOf(ApiError);
    expect(calls()).toEqual(['/me']);
    expect(ended).toHaveBeenCalledTimes(1);
    expect(await restoreSession()).toBe(false);
  });

  it('a 401 from /refresh forgets the tokens and goes to login', async () => {
    fetchMock
      .mockResolvedValueOnce(expired())
      .mockResolvedValueOnce(reply(401, { error: { code: 'session_ended', message: 'Please login again' } }));
    await expect(authedPost('/me')).rejects.toMatchObject({ code: 'session_ended' });
    expect(ended).toHaveBeenCalledTimes(1);
    expect(await restoreSession()).toBe(false);
  });

  it('403 account_deactivated from /refresh forgets the tokens and goes to login', async () => {
    fetchMock
      .mockResolvedValueOnce(expired())
      .mockResolvedValueOnce(reply(403, { error: { code: 'account_deactivated', message: 'This account is deactivated' } }));
    await expect(authedPost('/me')).rejects.toMatchObject({ code: 'account_deactivated' });
    expect(ended).toHaveBeenCalledTimes(1);
    expect(await restoreSession()).toBe(false);
  });

  it('a 429 from /refresh keeps the tokens', async () => {
    fetchMock
      .mockResolvedValueOnce(expired())
      .mockResolvedValueOnce(reply(429, { error: { code: 'rate_limited', message: 'Too many attempts' } }));
    await expect(authedPost('/me')).rejects.toMatchObject({ status: 429 });
    expect(ended).not.toHaveBeenCalled();
    expect(await restoreSession()).toBe(true);
  });

  it('a network error on /refresh keeps the tokens', async () => {
    fetchMock.mockResolvedValueOnce(expired()).mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(authedPost('/me')).rejects.toMatchObject({ code: 'network_error' });
    expect(ended).not.toHaveBeenCalled();
    expect(await restoreSession()).toBe(true);
  });
});

describe('refreshSession', () => {
  it('runs one /refresh at a time and shares its reply', async () => {
    let release!: (r: Response) => void;
    fetchMock.mockReturnValueOnce(new Promise<Response>((r) => (release = r)));
    const a = refreshSession();
    const b = refreshSession();
    release(reply(200, tokens(2)));
    await Promise.all([a, b]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
