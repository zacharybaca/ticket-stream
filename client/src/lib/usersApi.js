export const fetchUserProfile = (fetcher) => fetcher('/api/users/profile');

export const updateUserProfileRequest = (fetcher, payload) =>
  fetcher('/api/users/profile', {
    method: 'PUT',
    body: payload,
  });

export const deleteUserProfileRequest = (fetcher) =>
  fetcher('/api/users/profile', {
    method: 'DELETE',
  });
