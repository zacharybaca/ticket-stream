import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useFetcher } from '../../hooks/useFetcher.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useIncidentLiveUpdates } from '../../hooks/useIncidentLiveUpdates.js';
import { fetchIncidents, fetchIncidentSummary } from '../../lib/incidentsApi.js';
import StatusBadge from '../Incidents/StatusBadge.jsx';
import IncidentSlaBadge from '../Incidents/IncidentSlaBadge.jsx';
import SlaCountdown from '../Incidents/SlaCountdown.jsx';
import './incidents.css';

const defaultFilters = {
  search: '',
  status: '',
  priority: '',
  assignee: '',
};

const IncidentsDashboard = () => {
  const { fetcher } = useFetcher();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(defaultFilters);
  const [incidents, setIncidents] = useState([]);
  const [summary, setSummary] = useState({
    openCount: 0,
    criticalCount: 0,
    statusSummary: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const liveReloadTimeoutRef = useRef(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    const [incidentsResponse, summaryResponse] = await Promise.all([
      fetchIncidents(fetcher, filters),
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
  }, [fetcher, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    return () => {
      if (liveReloadTimeoutRef.current) {
        clearTimeout(liveReloadTimeoutRef.current);
      }
    };
  }, []);

  const eventMatchesFilters = useCallback(
    (payload = {}) => {
      if (!payload?.incidentId) return true;

      if (filters.status && payload.status !== filters.status) {
        return false;
      }

      if (filters.priority && payload.priority !== filters.priority) {
        return false;
      }

      if (filters.assignee === 'me' && payload.assigneeId !== user?._id) {
        return false;
      }

      if (filters.search) {
        const haystack = [
          payload.incidentCode,
          payload.title,
          payload.application,
          payload.service,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(filters.search.toLowerCase())) {
          return false;
        }
      }

      return true;
    },
    [filters, user?._id]
  );

  useIncidentLiveUpdates({
    onIncidentEvent: (payload) => {
      if (!eventMatchesFilters(payload)) return;

      if (liveReloadTimeoutRef.current) {
        clearTimeout(liveReloadTimeoutRef.current);
      }

      liveReloadTimeoutRef.current = setTimeout(() => {
        loadData();
      }, 250);
    },
  });

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  };

  const activeStatusCount =
    summary.statusSummary?.find((item) => item._id === 'open')?.count || 0;

  return (
    <div className="incidents-layout">
      <div className="incidents-header">
        <div>
          <h1>Incident Command Center</h1>
          <p className="muted-text">
            Monitor client-reported incidents across all applications your team supports.
          </p>
        </div>
        <button className="primary-btn" onClick={() => navigate('/incidents/new')}>
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
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search title, app, service, incident code"
        />
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="monitoring">Monitoring</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select name="priority" value={filters.priority} onChange={handleFilterChange}>
          <option value="">All priorities</option>
          <option value="p1">P1</option>
          <option value="p2">P2</option>
          <option value="p3">P3</option>
          <option value="p4">P4</option>
        </select>
        <select name="assignee" value={filters.assignee} onChange={handleFilterChange}>
          <option value="">Any assignee</option>
          <option value="me">Assigned to me</option>
        </select>
      </section>

      {error && <p className="validation-text">{error}</p>}
      {loading ? (
        <p>Loading incidents...</p>
      ) : (
        <table className="incidents-table">
          <thead>
            <tr>
              <th>Incident</th>
              <th>Priority</th>
              <th>Status</th>
              <th>SLA</th>
              <th>Application</th>
              <th>Assignee</th>
              <th>Last updated</th>
            </tr>
          </thead>
          <tbody>
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={7}>No incidents found for the selected filters.</td>
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
                    <IncidentSlaBadge sla={incident.sla} />
                    <div className="muted-text">
                      <SlaCountdown sla={incident.sla} />
                    </div>
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
      )}
    </div>
  );
};

export default IncidentsDashboard;
