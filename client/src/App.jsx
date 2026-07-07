import { Routes, Route, Outlet } from 'react-router-dom';
import NavBar from './components/Layout/NavBar/NavBar';
import Footer from './components/Layout/Footer/Footer';
import Login from './components/Auth/Login/Login';
import Register from './components/Auth/Register/Register';
import Home from './components/Pages/Home';
import IncidentsDashboard from './components/Pages/IncidentsDashboard';
import IncidentCreate from './components/Pages/IncidentCreate';
import IncidentDetails from './components/Pages/IncidentDetails';
import ForgotPassword from './components/Pages/ForgotPassword';
import ResetPassword from './components/Pages/ResetPassword';
import Profile from './components/Pages/Profile';
import Settings from './components/Pages/Settings';
import AdminDashboard from './components/Pages/AdminDashboard';
import ProtectedRoute from './components/Utility/ProtectedRoute/ProtectedRoute';
import AdminRoute from './components/Utility/AdminRoute/AdminRoute';
import './App.css';

const Layout = () => {
  return (
    <div className="app-container">
      <NavBar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="resetpassword/:token" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="incidents" element={<IncidentsDashboard />} />
          <Route path="incidents/new" element={<IncidentCreate />} />
          <Route path="incidents/:incidentId" element={<IncidentDetails />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="admin/dashboard" element={<AdminDashboard />} />
        </Route>

        <Route
          path="*"
          element={
            <div className="page-content">
              <h2>404: Page Not Found</h2>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
