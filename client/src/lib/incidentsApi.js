export const fetchIncidents = (fetcher, query = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  const route = queryString ? `/api/incidents?${queryString}` : '/api/incidents';

  return fetcher(route);
};

export const fetchIncidentSummary = (fetcher) => fetcher('/api/incidents/summary');

export const fetchIncidentById = (fetcher, incidentId) =>
  fetcher(`/api/incidents/${incidentId}`);

export const fetchIncidentSla = (fetcher, incidentId) =>
  fetcher(`/api/incidents/${incidentId}/sla`);

export const createIncidentRequest = (fetcher, payload) =>
  fetcher('/api/incidents', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateIncidentStatusRequest = (fetcher, incidentId, payload) =>
  fetcher(`/api/incidents/${incidentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const addIncidentCommentRequest = (fetcher, incidentId, payload) =>
  fetcher(`/api/incidents/${incidentId}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateIncidentRequest = (fetcher, incidentId, payload) =>
  fetcher(`/api/incidents/${incidentId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const fetchIncidentPostmortem = (fetcher, incidentId) =>
  fetcher(`/api/incidents/${incidentId}/postmortem`);

export const upsertIncidentPostmortem = (fetcher, incidentId, payload) =>
  fetcher(`/api/incidents/${incidentId}/postmortem`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const updateIncidentPostmortemExport = (fetcher, incidentId, format = 'json') =>
  fetcher(`/api/incidents/${incidentId}/postmortem/export`, {
    method: 'PATCH',
    body: JSON.stringify({ format }),
  });
