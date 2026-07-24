import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import NavbarLogo from '../Layout/Logo/NavbarLogo.jsx';
import './home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="container">
          <NavbarLogo className="home-logo" />

          <h1 className="visually-hidden">Ticket Stream</h1>

          {/* Your Final Tagline */}
          <p className="home-tagline">
            Less time debugging the client, more time debugging the code.
          </p>

          <p className="home-lead">
            Incident management workspace for software teams handling enterprise
            client outages, service degradation, and high-priority tickets.
          </p>

          <div className="hero-actions">
            {user ? (
              <>
                <Link to="/incidents" className="primary-home-btn">
                  Open Incident Center
                </Link>
                <Link to="/report" className="secondary-home-btn">
                  Report Incident
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="primary-home-btn">
                  Create account
                </Link>
                <Link to="/login" className="secondary-home-btn">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
