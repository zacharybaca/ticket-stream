import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFetcher } from '../../hooks/useFetcher.js';
import { requestForgotPassword } from '../../lib/authApi.js';
import '../Auth/auth-forms.css';

const ForgotPassword = () => {
  const { fetcher } = useFetcher();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const response = await requestForgotPassword(fetcher, email.trim());
    setSubmitting(false);

    if (!response.success) {
      toast.error(response.error || 'Failed to send reset link.');
      return;
    }

    toast.success('If this account exists, a reset email has been sent.');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2 className="auth-title">Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
        <p className="auth-footer">
          Back to <Link to="/login">login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
