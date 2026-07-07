import { useState } from 'react';

const roleOptions = ['observer', 'analyst', 'manager', 'admin'];

const RoleManagementPanel = ({ users, onUpdateRole }) => {
  const [pendingRoleMap, setPendingRoleMap] = useState({});

  const getRoleValue = (user) => pendingRoleMap[user._id] || user.role || 'analyst';

  return (
    <section className="incident-form">
      <h3 style={{ marginTop: 0 }}>Role Management</h3>
      <table className="incidents-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <select
                  value={getRoleValue(user)}
                  onChange={(event) =>
                    setPendingRoleMap((current) => ({
                      ...current,
                      [user._id]: event.target.value,
                    }))
                  }
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button
                  className="secondary-btn"
                  onClick={() => onUpdateRole(user._id, getRoleValue(user))}
                >
                  Save role
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default RoleManagementPanel;
