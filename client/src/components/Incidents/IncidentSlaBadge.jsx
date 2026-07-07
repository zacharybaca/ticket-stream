const riskToClassName = {
  'on-track': 'sla-badge sla-on-track',
  'at-risk': 'sla-badge sla-at-risk',
  breached: 'sla-badge sla-breached',
  resolved: 'sla-badge sla-resolved',
};

const IncidentSlaBadge = ({ sla }) => {
  const risk = sla?.risk || 'on-track';
  return <span className={riskToClassName[risk] || riskToClassName['on-track']}>{risk}</span>;
};

export default IncidentSlaBadge;
