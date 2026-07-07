import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import logo from '../../assets/ticket_stream_app_logo.png';
import './home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container">
          <img src={logo} alt="Ticket Stream Logo" className="home-logo" />
          <p className="home-lead">
            Incident management workspace for software teams handling enterprise
            client outages, service degradation, and high-priority tickets.
          </p>
          <div className="hero-actions">
            {user ? (
              <>
                <Link className="primary-home-btn" to="/incidents">
                  Open Incident Center
                </Link>
                <Link className="secondary-home-btn" to="/incidents/new">
                  Report Incident
                </Link>
              </>
            ) : (
              <>
                <Link className="primary-home-btn" to="/register">
                  Create account
                </Link>
                <Link className="secondary-home-btn" to="/login">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <h3>Incident triage board</h3>
          <p>
            Prioritize by severity, status, and ownership so support and
            engineering stay aligned.
          </p>
        </article>
        <article className="feature-card">
          <h3>Detailed timeline</h3>
          <p>
            Track status changes, assignments, and customer-impact notes from
            first report to closure.
          </p>
        </article>
        <article className="feature-card">
          <h3>Ops-ready API foundation</h3>
          <p>
            Protected REST endpoints designed for dashboard metrics and alerting
            integrations.
          </p>
        </article>
      </section>
    </div>
  );
};

export default Home;
