import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth.js';
import { useFetcher } from '../../hooks/useFetcher.js';
import { useIncidentLiveUpdates } from '../../hooks/useIncidentLiveUpdates.js';
import {
  addIncidentCommentRequest,
  fetchIncidentById,
  fetchIncidentPostmortem,
  updateIncidentPostmortemExport,
  updateIncidentRequest,
  updateIncidentStatusRequest,
  upsertIncidentPostmortem,
} from '../../lib/incidentsApi.js';
import StatusBadge from '../Incidents/StatusBadge.jsx';
import IncidentSlaBadge from '../Incidents/IncidentSlaBadge.jsx';
import SlaCountdown from '../Incidents/SlaCountdown.jsx';
import PostmortemEditor from '../Postmortems/PostmortemEditor.jsx';
import PostmortemViewer from '../Postmortems/PostmortemViewer.jsx';
import './incidents.css';

const IncidentDetails = () => {
  const navigate = useNavigate();
  const { incidentId } = useParams();
  const { fetcher } = useFetcher();
  const { user } = useAuth();

  const [incident, setIncident] = useState(null);
  const [postmortem, setPostmortem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [statusForm, setStatusForm] = useState({ status: '', note: '' });

  const canEditPostmortem =
    user?.isAdmin || ['admin', 'manager', 'analyst'].includes(user?.role);

  const timeline = useMemo(
    () =>
      [...(incident?.timeline || [])].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [incident?.timeline]
  );

  const loadIncident = useCallback(async () => {
    setLoading(true);
    const [incidentResponse, postmortemResponse] = await Promise.all([
      fetchIncidentById(fetcher, incidentId),
      fetchIncidentPostmortem(fetcher, incidentId),
    ]);
    setLoading(false);

    if (!incidentResponse.success) {
      toast.error(incidentResponse.error || 'Could not load incident details.');
      navigate('/incidents');
      return;
    }

    if (!postmortemResponse.success) {
      toast.error(postmortemResponse.error || 'Could not load postmortem data.');
      setPostmortem(null);
    } else {
      setPostmortem(postmortemResponse.data.postmortem || null);
    }

    setIncident(incidentResponse.data);
    setStatusForm((current) => ({ ...current, status: incidentResponse.data.status }));
  }, [fetcher, incidentId, navigate]);

  useEffect(() => {
    loadIncident();
  }, [loadIncident]);

  useIncidentLiveUpdates({
    incidentId,
    onIncidentEvent: () => loadIncident(),
  });

  const handleStatusSubmit = async (event) => {
    event.preventDefault();
    const response = await updateIncidentStatusRequest(fetcher, incidentId, statusForm);
    if (!response.success) {
      toast.error(response.error || 'Unable to update status.');
      return;
    }
    toast.success('Incident status updated.');
    setIncident(response.data);
    setStatusForm((previous) => ({ ...previous, note: '' }));
  };

  const handleAssignToMe = async () => {
    if (!user?._id) return;
    const response = await updateIncidentRequest(fetcher, incidentId, {
      assignee: user._id,
    });
    if (!response.success) {
      toast.error(response.error || 'Unable to assign incident.');
      return;
    }
    toast.success('Incident assigned to you.');
    setIncident(response.data);
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!commentText.trim()) return;

    const response = await addIncidentCommentRequest(fetcher, incidentId, {
      message: commentText.trim(),
    });
    if (!response.success) {
      toast.error(response.error || 'Unable to add comment.');
      return;
    }

    toast.success('Comment added.');
    setIncident(response.data);
    setCommentText('');
  };

  const handlePostmortemSave = async (payload) => {
    const response = await upsertIncidentPostmortem(fetcher, incidentId, payload);
    if (!response.success) {
      toast.error(response.error || 'Unable to save postmortem.');
      return;
    }

    setPostmortem(response.data.postmortem);
    toast.success('Postmortem saved.');
  };

  const handlePostmortemExport = async (formatValue) => {
    const response = await updateIncidentPostmortemExport(fetcher, incidentId, formatValue);
    if (!response.success) {
      toast.error(response.error || 'Unable to update export metadata.');
      return;
    }

    setPostmortem(response.data.postmortem);
    toast.success('Export metadata recorded.');
  };

  if (loading) {
    return (
      <div className="incidents-layout">
        <p>Loading incident details...</p>
      </div>
    );
  }

  if (!incident) return null;

  return (
    <div className="incidents-layout">
      <div className="incidents-header">
        <div>
          <h1>
            {incident.incidentCode} — {incident.title}
          </h1>
          <p className="muted-text">{incident.description}</p>
        </div>
        <button className="secondary-btn" onClick={() => navigate('/incidents')}>
          Back to incidents
        </button>
      </div>

      <section className="incident-meta-card">
        <div className="details-grid">
          <div>
            <p className="metric-label">Status</p>
            <StatusBadge status={incident.status} />
          </div>
          <div>
            <p className="metric-label">Priority</p>
            <p className="metric-value">{incident.priority.toUpperCase()}</p>
          </div>
          <div>
            <p className="metric-label">Severity</p>
            <p className="metric-value">{incident.severity}</p>
          </div>
          <div>
            <p className="metric-label">SLA</p>
            <p className="metric-value">
              <IncidentSlaBadge sla={incident.sla} />
              <br />
              <span className="muted-text">
                Remaining: <SlaCountdown sla={incident.sla} />
              </span>
            </p>
          </div>
          <div>
            <p className="metric-label">Application / Service</p>
            <p className="metric-value">
              {incident.application}
              <br />
              <span className="muted-text">{incident.service}</span>
            </p>
          </div>
          <div>
            <p className="metric-label">Assignee</p>
            <p className="metric-value">{incident.assignee?.name || 'Unassigned'}</p>
          </div>
          <div>
            <p className="metric-label">Reported by</p>
            <p className="metric-value">{incident.reportedBy?.name || 'Unknown'}</p>
          </div>
        </div>
      </section>

      <section className="incident-form" style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Update status</h3>
        <form className="form-grid" onSubmit={handleStatusSubmit}>
          <div>
            <label className="field-label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              value={statusForm.status}
              onChange={(event) =>
                setStatusForm((prev) => ({
                  ...prev,
                  status: event.target.value,
                }))
              }
            >
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="monitoring">Monitoring</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="status-note">
              Update note
            </label>
            <input
              id="status-note"
              type="text"
              value={statusForm.note}
              onChange={(event) =>
                setStatusForm((prev) => ({ ...prev, note: event.target.value }))
              }
              placeholder="Investigating database connection pool"
            />
          </div>
          <div style={{ alignSelf: 'end' }}>
            <button type="submit" className="primary-btn">
              Save status
            </button>
          </div>
        </form>
        <div>
          <button type="button" className="secondary-btn" onClick={handleAssignToMe}>
            Assign to me
          </button>
        </div>
      </section>

      <section className="incident-form" style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Add timeline comment</h3>
        <form className="comment-form" onSubmit={handleCommentSubmit}>
          <textarea
            rows={3}
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Post updates from engineering investigation..."
          />
          <div>
            <button type="submit" className="primary-btn">
              Add comment
            </button>
          </div>
        </form>
      </section>

      <PostmortemViewer postmortem={postmortem} />
      {canEditPostmortem && (
        <PostmortemEditor
          value={postmortem}
          onSave={handlePostmortemSave}
          onExport={handlePostmortemExport}
        />
      )}

      <section>
        <h3>Activity timeline</h3>
        {timeline.length === 0 ? (
          <p className="muted-text">No timeline entries yet.</p>
        ) : (
          <ul className="timeline">
            {timeline.map((entry, index) => (
              <li key={`${entry.createdAt}-${index}`} className="timeline-entry">
                <p className="entry-title">{entry.message}</p>
                <p className="entry-meta">
                  {entry.type} by {entry.createdBy?.name || 'Unknown'} on{' '}
                  {format(new Date(entry.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
                {(entry.from || entry.to) && (
                  <p className="entry-meta">
                    {entry.from || 'n/a'} → {entry.to || 'n/a'}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default IncidentDetails;
