const formatRemaining = (remainingMs) => {
  if (remainingMs === undefined || remainingMs === null) return 'n/a';

  if (remainingMs <= 0) return 'Breached';

  const totalMinutes = Math.floor(remainingMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const SlaCountdown = ({ sla }) => {
  return <span>{formatRemaining(sla?.remainingMs)}</span>;
};

export default SlaCountdown;
