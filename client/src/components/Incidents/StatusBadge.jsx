import './status-badge.css';

const StatusBadge = ({ status }) => {
  const safeStatus = status || 'unknown';
  const label = safeStatus.replace('-', ' ');

  return <span className={`status-badge status-${safeStatus}`}>{label}</span>;
};

export default StatusBadge;
