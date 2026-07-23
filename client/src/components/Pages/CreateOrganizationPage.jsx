import { SignIn, CreateOrganization } from '@clerk/clerk-react';
import { useClerkAuth } from '../../hooks/useClerkAuth.js';
import './create-organization-page.css';

// Inner component — only rendered when ClerkProvider is in the tree.
const ClerkOrgPage = () => {
  const { isSignedIn, isLoaded } = useClerkAuth();

  if (!isLoaded) {
    return (
      <div
        className="page-content"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading organization page"
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="page-content clerk-embed">
        {/*
         * routing="hash" is intentional here: there is no dedicated Clerk sign-in
         * route in this app. Hash routing embeds the sign-in flow inline at the
         * current URL without requiring a separate route configuration.
         */}
        <SignIn routing="hash" />
      </div>
    );
  }

  return (
    <div className="page-content clerk-embed">
      {/*
       * routing="path" is correct here because /organizations/new is a registered
       * app route. The path prop lets Clerk construct sub-page URLs within the
       * multi-step create-organization flow.
       */}
      <CreateOrganization routing="path" path="/organizations/new" />
    </div>
  );
};

const CreateOrganizationPage = () => {
  const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

  if (!clerkEnabled) {
    return (
      <div className="page-content">
        <h2>Clerk is not configured</h2>
        <p>
          Set VITE_CLERK_PUBLISHABLE_KEY in client/.env.local and restart the
          dev server.
        </p>
      </div>
    );
  }

  return <ClerkOrgPage />;
};

export default CreateOrganizationPage;
