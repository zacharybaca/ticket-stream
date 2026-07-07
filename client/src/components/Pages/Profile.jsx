import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFetcher } from '../../hooks/useFetcher.js';
import {
  deleteUserProfileRequest,
  fetchUserProfile,
  updateUserProfileRequest,
} from '../../lib/usersApi.js';
import './incidents.css';

const Profile = () => {
  const navigate = useNavigate();
  const { fetcher } = useFetcher();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const response = await fetchUserProfile(fetcher);
      setLoading(false);

      if (!response.success) {
        toast.error(response.error || 'Unable to load profile.');
        return;
      }

      setProfile(response.data.user || response.data);
    };

    loadProfile();
  }, [fetcher]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!profile) return;

    setSubmitting(true);
    const formData = new FormData(event.currentTarget);

    const response = await updateUserProfileRequest(fetcher, formData);
    setSubmitting(false);

    if (!response.success) {
      toast.error(response.error || 'Unable to update profile.');
      return;
    }

    setProfile(response.data);
    toast.success('Profile updated.');
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account?');
    if (!confirmed) return;

    const response = await deleteUserProfileRequest(fetcher);
    if (!response.success) {
      toast.error(response.error || 'Unable to delete account.');
      return;
    }

    toast.success('Account deleted.');
    navigate('/register');
  };

  if (loading) {
    return (
      <div className="incidents-layout">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="incidents-layout">
      <div className="incidents-header">
        <div>
          <h1>My Profile</h1>
          <p className="muted-text">Manage your account details and avatar.</p>
        </div>
      </div>

      <form className="incident-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <label className="field-label" htmlFor="name">
              Name
            </label>
            <input id="name" name="name" defaultValue={profile.name} required />
          </div>
          <div>
            <label className="field-label" htmlFor="username">
              Username
            </label>
            <input id="username" name="username" defaultValue={profile.username} required />
          </div>
          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" defaultValue={profile.email} required />
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              New Password (optional)
            </label>
            <input id="password" name="password" type="password" minLength={8} />
          </div>
          <div>
            <label className="field-label" htmlFor="avatar">
              Avatar
            </label>
            <input id="avatar" name="avatar" type="file" accept="image/*" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save profile'}
          </button>
          <button type="button" className="secondary-btn" onClick={handleDelete}>
            Delete account
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
