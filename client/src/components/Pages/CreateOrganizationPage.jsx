import { SignIn, CreateOrganization } from '@clerk/react-router';
import { useClerkAuth } from '../../hooks/useClerkAuth.js';
import './create-organization-page.css';

// Inner component — only rendered when ClerkProvider is in the tree.
const ClerkOrgPage = () => {
  const { isSignedIn, isLoaded } = useClerkAuth();

  if (!isLoaded) {
    return (
      <div className="page-content" role="status" aria-live="polite">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="page-content clerk-embed">
        <SignIn routing="hash" />
      </div>
    );
  }

  return (
    <div className="page-content clerk-embed">
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
        <p>Set VITE_CLERK_PUBLISHABLE_KEY in client/.env.local and restart the dev server.</p>
      </div>
    );
  }

  return <ClerkOrgPage />;
};

export default CreateOrganizationPage;
