import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth.js';
import { useFetcher } from '../../../hooks/useFetcher.js';
import '../auth-forms.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { checkUserAuth } = useAuth();
  const { fetcher } = useFetcher();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetcher('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.success) {
        await checkUserAuth();
        const origin = location.state?.from?.pathname || '/';
        navigate(origin);
      } else {
        toast.error(response.error || 'Login failed. Check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-form-group">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <label>Password</label>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: '0.85rem',
                  color: '#10b981',
                  textDecoration: 'none',
                }}
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
