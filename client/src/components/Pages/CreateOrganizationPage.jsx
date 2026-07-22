import { CreateOrganization } from '@clerk/react-router';

const CreateOrganizationPage = () => {
  return (
    <div className="page-content" style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
      <CreateOrganization routing="path" path="/organizations/new" />
    </div>
  );
};

export default CreateOrganizationPage;
