export const requestForgotPassword = (fetcher, email) =>
  fetcher('/api/auth/forgotpassword', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const requestResetPassword = (fetcher, token, password) =>
  fetcher(`/api/auth/resetpassword/${token}`, {
    method: 'PUT',
    body: JSON.stringify({ password }),
  });
