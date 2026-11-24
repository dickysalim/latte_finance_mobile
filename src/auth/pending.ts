/**
 * The email just used to sign up, kept in memory for the "check your email" screen.
 * Not in the URL (addresses do not belong in links) and not on disk.
 */
let pendingEmail: string | null = null;

export const setPendingEmail = (email: string | null) => {
  pendingEmail = email;
};
export const getPendingEmail = () => pendingEmail;
