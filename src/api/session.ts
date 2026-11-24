import { ApiError, apiPost } from './client';
import { clearRefreshToken, loadRefreshToken, saveRefreshToken } from './storage';

type TokenPair = { access_token: string; refresh_token: string };

let accessToken: string | null = null;
let refreshToken: string | null = null;
let inFlightRefresh: Promise<void> | null = null;
let onSessionEnded: (() => void) | null = null;

/** The auth provider registers here to hear that the user must see the login screen. */
export function setSessionEndedListener(listener: (() => void) | null): void {
  onSessionEnded = listener;
}

/** Called after /login or /google-login. Keeps the access token in memory and the refresh token on the device. */
export async function startSession(tokens: TokenPair): Promise<void> {
  accessToken = tokens.access_token;
  refreshToken = tokens.refresh_token;
  await saveRefreshToken(tokens.refresh_token);
}

/** A route that returns only a new access token (first household, accept invite, leave). */
export function setAccessToken(token: string): void {
  accessToken = token;
}

/** Reads the stored refresh token at app start. True when there is one to try. */
export async function restoreSession(): Promise<boolean> {
  refreshToken = await loadRefreshToken();
  return refreshToken !== null;
}

/** Forget both tokens, here and on the device. */
export async function clearSession(): Promise<void> {
  accessToken = null;
  refreshToken = null;
  await clearRefreshToken();
}

/**
 * One /refresh at a time. Callers that arrive while one is running wait for it,
 * so only the reply of the latest call is kept.
 * 401 or 403 account_deactivated: forget the tokens and tell the app (login screen). 429 or network error: keep the tokens and throw.
 */
export function refreshSession(): Promise<void> {
  inFlightRefresh ??= doRefresh().finally(() => {
    inFlightRefresh = null;
  });
  return inFlightRefresh;
}

async function doRefresh(): Promise<void> {
  if (!refreshToken) {
    await endSession();
    throw new ApiError(401, 'session_ended', 'Please login again');
  }
  try {
    const reply = await apiPost<TokenPair>('/refresh', { refresh_token: refreshToken });
    accessToken = reply.access_token;
    refreshToken = reply.refresh_token;
    await saveRefreshToken(reply.refresh_token);
  } catch (error) {
    // 401 (session_ended, session_expired) and 403 account_deactivated: the session is over.
    // 429 and network errors keep the tokens.
    if (error instanceof ApiError && (error.status === 401 || error.code === 'account_deactivated')) {
      await endSession();
    }
    throw error;
  }
}

async function endSession(): Promise<void> {
  await clearSession();
  onSessionEnded?.();
}

/**
 * POST with the access token. On 401 token_expired: refresh once, retry once.
 * Any other 401 sends the user to login.
 */
export async function authedPost<TResponse>(
  path: string,
  body: Record<string, unknown> = {},
): Promise<TResponse> {
  if (!accessToken) await refreshSession();
  try {
    return await apiPost<TResponse>(path, body, { accessToken: accessToken ?? undefined });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    if (!error.isTokenExpired) {
      await endSession();
      throw error;
    }
    await refreshSession();
    try {
      return await apiPost<TResponse>(path, body, { accessToken: accessToken ?? undefined });
    } catch (retryError) {
      if (retryError instanceof ApiError && retryError.status === 401) await endSession();
      throw retryError;
    }
  }
}
