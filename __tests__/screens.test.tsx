import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/api';
import Flow1Finished from '@/app/index';
import LoginScreen from '@/app/login';

const mockReload = jest.fn();
const mockSignOut = jest.fn();
let mockMe: unknown = null;

jest.mock('@/auth/provider', () => ({
  useAuth: () => ({ me: mockMe, reload: mockReload, signOut: mockSignOut, status: 'ready' }),
}));
jest.mock('expo-secure-store', () => ({}));
jest.mock('@/api', () => {
  const actual = jest.requireActual('@/api');
  return { ...actual, login: jest.fn(), googleLogin: jest.fn(), resendVerification: jest.fn() };
});

const api = jest.requireMock('@/api') as { login: jest.Mock; resendVerification: jest.Mock };

beforeEach(() => {
  jest.clearAllMocks();
  mockMe = null;
});

describe('Flow 1 finished panel', () => {
  it('shows the title, the name with each word capitalised, the household and a log out button', async () => {
    mockMe = { name: 'anne-marie de vries', household_owner_name: 'alice smith' };
    await render(<Flow1Finished />);
    expect(screen.getByText('Flow 1 finished')).toBeTruthy();
    expect(screen.getByText('Anne-Marie De Vries')).toBeTruthy();
    expect(screen.getByText("Alice Smith's household")).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Log out' }));
    expect(mockSignOut).toHaveBeenCalled();
  });
});

describe('LoginScreen', () => {
  it('logs in with the cleaned identifier, then reloads the user', async () => {
    api.login.mockResolvedValue({});
    await render(<LoginScreen />);
    await fireEvent.changeText(screen.getByLabelText('Email or username'), '  Alice@Example.com ');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'correct horse');
    await fireEvent.press(screen.getByRole('button', { name: 'Log in' }));
    await waitFor(() => expect(mockReload).toHaveBeenCalled());
    expect(api.login).toHaveBeenCalledWith('alice@example.com', 'correct horse');
  });

  it('shows the worker message for wrong credentials', async () => {
    api.login.mockRejectedValue(new ApiError(401, 'invalid_credentials', 'Wrong email, username or password'));
    await render(<LoginScreen />);
    await fireEvent.changeText(screen.getByLabelText('Email or username'), 'alice');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'nope nope');
    await fireEvent.press(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Wrong email, username or password')).toBeTruthy();
    expect(mockReload).not.toHaveBeenCalled();
  });

  it('offers to resend the link when the email is not verified', async () => {
    api.login.mockRejectedValue(new ApiError(403, 'email_not_verified', 'Please verify your email first'));
    api.resendVerification.mockResolvedValue({});
    await render(<LoginScreen />);
    await fireEvent.changeText(screen.getByLabelText('Email or username'), 'alice');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'correct horse');
    await fireEvent.press(screen.getByRole('button', { name: 'Log in' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Send the link again' }));
    await waitFor(() => expect(api.resendVerification).toHaveBeenCalledWith('alice'));
    expect(await screen.findByRole('button', { name: /Send the link again in \d+s/ })).toBeTruthy();
  });

  it('offers sign up again when the sign-up was abandoned', async () => {
    api.login.mockRejectedValue(new ApiError(403, 'signup_abandoned', 'This sign-up was abandoned, please sign up again'));
    await render(<LoginScreen />);
    await fireEvent.changeText(screen.getByLabelText('Email or username'), 'alice');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'correct horse');
    await fireEvent.press(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Sign up again')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Send the link again' })).toBeNull();
  });

  it('hides the Google button when no client ID is configured', async () => {
    await render(<LoginScreen />);
    expect(screen.queryByRole('button', { name: 'Continue with Google' })).toBeNull();
  });
});
