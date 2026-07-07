import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isAdmin || user.role === 'admin') {
    return <Outlet />;
  }

  return <Navigate to="/" replace />;
};

export default AdminRoute;
