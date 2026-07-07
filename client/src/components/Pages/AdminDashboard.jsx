import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import RoleManagementPanel from '../Admin/RoleManagementPanel.jsx';
import { useFetcher } from '../../hooks/useFetcher.js';
import { fetchAdminUsers, updateUserRoleRequest } from '../../lib/adminApi.js';
import './incidents.css';

const AdminDashboard = () => {
  const { fetcher } = useFetcher();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    const response = await fetchAdminUsers(fetcher);
    setLoading(false);

    if (!response.success) {
      toast.error(response.error || 'Unable to load users.');
      return;
    }

    setUsers(response.data.users || []);
  };

  useEffect(() => {
    loadUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateRole = async (userId, role) => {
    const response = await updateUserRoleRequest(fetcher, userId, role);
    if (!response.success) {
      toast.error(response.error || 'Unable to update role.');
      return;
    }

    setUsers((current) =>
      current.map((user) => (user._id === userId ? { ...user, ...response.data } : user))
    );
    toast.success('Role updated.');
  };

  return (
    <div className="incidents-layout">
      <div className="incidents-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="muted-text">Assign role permissions for incident workflow access.</p>
        </div>
      </div>

      {loading ? <p>Loading users...</p> : <RoleManagementPanel users={users} onUpdateRole={handleUpdateRole} />}
    </div>
  );
};

export default AdminDashboard;
