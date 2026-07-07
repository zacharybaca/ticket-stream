import { useEffect } from 'react';
import { useSocket } from './useSocket.js';

export const useIncidentLiveUpdates = ({ incidentId, onIncidentEvent } = {}) => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !onIncidentEvent) return;

    const handleIncidentEvent = (payload) => {
      if (!incidentId || payload.incidentId === incidentId) {
        onIncidentEvent(payload);
      }
    };

    socket.on('incident:updated', handleIncidentEvent);
    socket.on('incident:user-updated', handleIncidentEvent);
    socket.on('incident:detail-updated', handleIncidentEvent);

    if (incidentId) {
      socket.emit('join_incident_room', incidentId);
    }

    return () => {
      socket.off('incident:updated', handleIncidentEvent);
      socket.off('incident:user-updated', handleIncidentEvent);
      socket.off('incident:detail-updated', handleIncidentEvent);

      if (incidentId) {
        socket.emit('leave_incident_room', incidentId);
      }
    };
  }, [incidentId, onIncidentEvent, socket]);
};
