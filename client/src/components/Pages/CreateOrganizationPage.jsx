import { CreateOrganization } from '@clerk/react-router';

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

  return (
    <div className="page-content" style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
      <CreateOrganization routing="path" path="/organizations/new" />
    </div>
  );
};

export default CreateOrganizationPage;
