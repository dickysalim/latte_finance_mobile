import { apiPost } from './client';
import { authedPost, clearSession, setAccessToken, startSession } from './session';

export type LoginReply = {
  access_token: string;
  refresh_token: string;
  household_needed: boolean;
  profile_needed: boolean;
};

export type Me = {
  id: string;
  email: string;
  username: string | null;
  name: string;
  household_id: string | null;
  /** Stored lowercase; null when there is no household. Show it with displayName(). */
  household_owner_name: string | null;
  home_household_id: string | null;
  profile_needed: boolean;
  household_needed: boolean;
  can_leave: boolean;
  has_password: boolean;
  has_google: boolean;
};

export type WaitingInvite = {
  invite_id: string;
  household_id: string;
  invited_by_name: string;
  created_at: number;
};

export type SignupInput = { email: string; username: string; name: string; password: string };
export type InviteSignupInput = { token: string; username: string; name: string; password: string };
export type CompleteProfileInput = { username: string; name: string; password: string };

export const signUp = (input: SignupInput) => apiPost<{ message: string }>('/normal-signup', input);

export const googleSignUp = (idToken: string) =>
  apiPost<{ profile_needed: boolean }>('/google-signup', { id_token: idToken });

export const inviteSignUp = (input: InviteSignupInput) =>
  apiPost<{ household_id: string }>('/invite-signup', input);

export const verifyEmail = (token: string, password?: string) =>
  apiPost<{ verified: boolean }>('/email-verification', password ? { token, password } : { token });

export const resendVerification = (identifier: string) =>
  apiPost<{ message: string }>('/email-verification-resend', { identifier });

export async function login(identifier: string, password: string): Promise<LoginReply> {
  const reply = await apiPost<LoginReply>('/login', { identifier, password });
  await startSession(reply);
  return reply;
}

export async function googleLogin(idToken: string): Promise<LoginReply> {
  const reply = await apiPost<LoginReply>('/google-login', { id_token: idToken });
  await startSession(reply);
  return reply;
}

export const completeProfile = (input: CompleteProfileInput) =>
  authedPost<Record<string, never>>('/complete-profile', input);

export const getMe = () => authedPost<Me>('/me');

export const listInvites = () => authedPost<{ invites: WaitingInvite[] }>('/invites');

export async function createHousehold(options: { ignoreInvites?: boolean; timezone?: string }) {
  const reply = await authedPost<{ access_token: string; household_id: string }>('/first-login-household', {
    ...(options.ignoreInvites ? { ignore_invites: true } : {}),
    ...(options.timezone ? { timezone: options.timezone } : {}),
  });
  setAccessToken(reply.access_token);
  return reply;
}

export async function acceptInvite(inviteId: string) {
  const reply = await authedPost<{ access_token: string; household_id: string }>('/accept-invite', {
    invite_id: inviteId,
  });
  setAccessToken(reply.access_token);
  return reply;
}

/** Ends this device's session on the server, then forgets the tokens whatever the server said. */
export async function logout(): Promise<void> {
  try {
    await authedPost('/logout');
  } catch {
    // The tokens go either way; the server session ends by itself after 30 days.
  } finally {
    await clearSession();
  }
}
