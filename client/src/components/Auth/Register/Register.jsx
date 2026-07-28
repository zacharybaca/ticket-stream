import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFetcher } from '../../../hooks/useFetcher.js';
import '../auth-forms.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    companyId: '',
  });
  const [companies, setCompanies] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const { fetcher } = useFetcher();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const loadCompanies = async () => {
      const response = await fetcher(
        '/api/auth/registration-companies',
        {},
        'Failed to load companies.'
      );

      if (response?.success) {
        setCompanies(Array.isArray(response.data) ? response.data : []);
      } else {
        toast.error(response?.error || 'Failed to load companies.');
      }

      setIsLoadingCompanies(false);
    };

    loadCompanies();
  }, [fetcher]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetcher('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (response.success) {
      navigate('/login', {
        state: { message: 'Registration successful! Please log in.' },
      });
    } else {
      toast.error(response.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="auth-form-group">
            <label>Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="companyId">Company</label>
            <select
              id="companyId"
              name="companyId"
              value={formData.companyId}
              onChange={(e) =>
                setFormData({ ...formData, companyId: e.target.value })
              }
              required
              disabled={isLoadingCompanies}
            >
              <option value="">
                {isLoadingCompanies ? 'Loading companies...' : 'Select company'}
              </option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.name} ({company.domain})
                </option>
              ))}
            </select>
          </div>
          <div className="auth-form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="auth-form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoadingCompanies}
          >
            Create Account
          </button>
        </form>
        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
