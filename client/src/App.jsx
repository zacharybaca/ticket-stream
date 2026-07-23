import { Routes, Route, Outlet } from 'react-router-dom';
import NavBar from './components/Layout/NavBar/NavBar';
import Footer from './components/Layout/Footer/Footer';
import Login from './components/Auth/Login/Login';
import Register from './components/Auth/Register/Register';
import Home from './components/Pages/Home';
import IncidentsDashboard from './components/Pages/IncidentsDashboard';
import IncidentCreate from './components/Pages/IncidentCreate';
import IncidentDetails from './components/Pages/IncidentDetails';
import ProtectedRoute from './components/Utility/ProtectedRoute/ProtectedRoute';
import CreateOrganizationPage from './components/Pages/CreateOrganizationPage';
import './App.css';

// The Layout Component: Wraps pages with Header and Footer
const Layout = () => {
  return (
    <div className="app-container">
      <NavBar />
      <main className="main-content">
        {/* Outlet renders the child route's element (e.g., Home, Login) */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Wrap all routes in the Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="incidents" element={<IncidentsDashboard />} />
          <Route path="incidents/new" element={<IncidentCreate />} />
          <Route path="incidents/:incidentId" element={<IncidentDetails />} />
          <Route
            path="organizations/new"
            element={<CreateOrganizationPage />}
          />
        </Route>

        {/* Catch-all for 404s */}
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
