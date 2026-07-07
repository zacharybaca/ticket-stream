export const fetchAdminUsers = (fetcher) => fetcher('/api/admin/users');

export const updateUserRoleRequest = (fetcher, userId, role) =>
  fetcher(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
