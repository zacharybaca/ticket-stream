import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useFetcher } from '../../hooks/useFetcher.js';
import {
  fetchIncidents,
  fetchIncidentSummary,
} from '../../lib/incidentsApi.js';
import StatusBadge from '../Incidents/StatusBadge.jsx';
import './incidents.css';

const IncidentsDashboard = () => {
  const { fetcher } = useFetcher();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  const priority = searchParams.get('priority') ?? '';
  const assignee = searchParams.get('assignee') ?? '';
  const [incidents, setIncidents] = useState([]);
  const [summary, setSummary] = useState({
    openCount: 0,
    criticalCount: 0,
    statusSummary: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      const [incidentsResponse, summaryResponse] = await Promise.all([
        fetchIncidents(fetcher, { search, status, priority, assignee }),
        fetchIncidentSummary(fetcher),
      ]);

      if (!incidentsResponse.success) {
        setError(incidentsResponse.error || 'Failed to load incidents.');
        setIncidents([]);
        setLoading(false);
        return;
      }

      if (!summaryResponse.success) {
        setError(summaryResponse.error || 'Failed to load incident summary.');
        setSummary({ openCount: 0, criticalCount: 0, statusSummary: [] });
        setLoading(false);
        return;
      }

      setIncidents(incidentsResponse.data.incidents || []);
      setSummary(summaryResponse.data);
      setLoading(false);
    };

    loadData();
  }, [search, status, priority, assignee, fetcher]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    const next = { ...Object.fromEntries(searchParams), [name]: value };
    Object.keys(next).forEach((key) => {
      if (!next[key]) delete next[key];
    });
    setSearchParams(next, { replace: name === 'search' });
  };

  const activeStatusCount =
    summary.statusSummary?.find((item) => item._id === 'open')?.count || 0;

  return (
    <div className="incidents-layout">
      <div className="incidents-header">
        <div>
          <h1>Incident Command Center</h1>
          <p className="muted-text">
            Monitor client-reported incidents across all applications your team
            supports.
          </p>
        </div>
        <button
          className="primary-btn"
          onClick={() => navigate('/incidents/new')}
        >
          Create Incident
        </button>
      </div>

      <section className="metrics-grid">
        <article className="metric-card">
          <p className="metric-label">Open incidents</p>
          <p className="metric-value">{summary.openCount}</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">Critical active incidents</p>
          <p className="metric-value">{summary.criticalCount}</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">New incidents</p>
          <p className="metric-value">{activeStatusCount}</p>
        </article>
      </section>

      <section className="incidents-filters">
        <input
          type="text"
          name="search"
          value={search}
          onChange={handleFilterChange}
          placeholder="Search title, app, service, incident code"
        />
        <select name="status" value={status} onChange={handleFilterChange}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="monitoring">Monitoring</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select name="priority" value={priority} onChange={handleFilterChange}>
          <option value="">All priorities</option>
          <option value="p1">P1</option>
          <option value="p2">P2</option>
          <option value="p3">P3</option>
          <option value="p4">P4</option>
        </select>
        <select name="assignee" value={assignee} onChange={handleFilterChange}>
          <option value="">Any assignee</option>
          <option value="me">Assigned to me</option>
        </select>
      </section>

      {error && <p className="validation-text">{error}</p>}
      {loading ? (
        <p>Loading incidents...</p>
      ) : (
        <>
          <div
            className="incidents-table-wrapper"
            role="region"
            aria-label="Incidents table"
            tabIndex={0}
          >
            <table className="incidents-table">
              <thead>
                <tr>
                  <th>Incident</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Application</th>
                  <th>Assignee</th>
                  <th>Last updated</th>
                </tr>
              </thead>
              <tbody>
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      No incidents found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  incidents.map((incident) => (
                    <tr key={incident._id}>
                      <td>
                        <button
                          className="table-link-btn"
                          onClick={() => navigate(`/incidents/${incident._id}`)}
                        >
                          {incident.incidentCode} — {incident.title}
                        </button>
                      </td>
                      <td>{incident.priority?.toUpperCase()}</td>
                      <td>
                        <StatusBadge status={incident.status} />
                      </td>
                      <td>
                        {incident.application}
                        <div className="muted-text">{incident.service}</div>
                      </td>
                      <td>{incident.assignee?.name || 'Unassigned'}</td>
                      <td>
                        {formatDistanceToNow(new Date(incident.updatedAt), {
                          addSuffix: true,
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="incidents-card-list" aria-label="Incidents list">
            {incidents.length === 0 ? (
              <p className="muted-text">
                No incidents found for the selected filters.
              </p>
            ) : (
              incidents.map((incident) => (
                <div
                  key={incident._id}
                  className="incident-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/incidents/${incident._id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/incidents/${incident._id}`);
                    }
                  }}
                >
                  <div className="incident-card-header">
                    <span className="table-link-btn incident-card-title">
                      {incident.incidentCode} — {incident.title}
                    </span>
                    <StatusBadge status={incident.status} />
                  </div>
                  <div className="incident-card-meta">
                    <div className="incident-card-field">
                      <span className="metric-label">Priority</span>
                      <span className="incident-card-value">
                        {incident.priority?.toUpperCase()}
                      </span>
                    </div>
                    <div className="incident-card-field">
                      <span className="metric-label">Assignee</span>
                      <span className="incident-card-value">
                        {incident.assignee?.name || 'Unassigned'}
                      </span>
                    </div>
                    <div className="incident-card-field">
                      <span className="metric-label">Application</span>
                      <span className="incident-card-value">
                        {incident.application}
                        {incident.service && (
                          <span className="muted-text">
                            {' '}
                            / {incident.service}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="incident-card-field">
                      <span className="metric-label">Last updated</span>
                      <span className="incident-card-value">
                        {formatDistanceToNow(new Date(incident.updatedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default IncidentsDashboard;
