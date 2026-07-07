import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFetcher } from '../../hooks/useFetcher.js';
import { requestResetPassword } from '../../lib/authApi.js';
import '../Auth/auth-forms.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { fetcher } = useFetcher();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const response = await requestResetPassword(fetcher, token, password);
    setSubmitting(false);

    if (!response.success) {
      toast.error(response.error || 'Reset token is invalid or expired.');
      return;
    }

    toast.success('Password reset successful. Please log in.');
    navigate('/login');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2 className="auth-title">Create New Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="auth-form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
            />
          </div>
          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? 'Saving...' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
