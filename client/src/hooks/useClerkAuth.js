import { useUser, useAuth, useSignIn, useSignUp, useClerk } from '@clerk/react-router';

/**
 * Convenience wrapper around Clerk's core hooks.
 *
 * Returns the most commonly needed Clerk state and actions in one call so
 * components don't have to import from multiple Clerk hooks directly.
 *
 * Usage:
 *   const { user, isSignedIn, isLoaded, getToken, signOut } = useClerkAuth();
 */
export const useClerkAuth = () => {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { getToken, signOut } = useAuth();
  const { isLoaded: isSignInLoaded, signIn } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp } = useSignUp();
  const clerk = useClerk();

  const isLoaded = isUserLoaded && isSignInLoaded && isSignUpLoaded;

  return {
    /** The current Clerk user object, or null when signed out. */
    user,
    /**
     * True once Clerk has finished loading the underlying resources returned by this hook.
     * When false, `signIn`/`signUp` may be undefined and should not be used yet.
     */
    isLoaded,
    /** True when an active Clerk session exists. */
    isSignedIn,
    /**
     * Retrieves a short-lived JWT from Clerk.
     * Pass `{ template: 'your-template' }` to use a custom JWT template.
     */
    getToken,
    /** Signs the user out and ends the Clerk session. */
    signOut,
    /** Clerk's signIn resource — use to programmatically trigger sign-in flows. */
    signIn,
    /** Clerk's signUp resource — use to programmatically trigger sign-up flows. */
    signUp,
    /** The raw Clerk instance for advanced use cases (e.g., openSignIn modal). */
    clerk,
  };
};
