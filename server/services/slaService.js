import SlaPolicy from "../models/SlaPolicy.js";

const DEFAULT_POLICY = {
  priorities: {
    p1: 1,
    p2: 4,
    p3: 12,
    p4: 24,
  },
  warningThresholdMinutes: 30,
};

const getActiveSlaPolicy = async () => {
  const policy = await SlaPolicy.findOne({ isActive: true })
    .sort({ updatedAt: -1 })
    .lean();

  return policy || DEFAULT_POLICY;
};

const evaluateIncidentSla = (incident, policy = DEFAULT_POLICY) => {
  const priority = incident.priority || "p3";
  const targetHours = policy?.priorities?.[priority] || DEFAULT_POLICY.priorities.p3;

  const createdAt = new Date(incident.createdAt || Date.now());
  const deadlineAt = new Date(createdAt.getTime() + targetHours * 60 * 60 * 1000);

  const closedStatuses = new Set(["resolved", "closed"]);
  const isClosed = closedStatuses.has(incident.status);
  const now = Date.now();
  const remainingMs = deadlineAt.getTime() - now;
  const warningThresholdMs =
    (policy?.warningThresholdMinutes || DEFAULT_POLICY.warningThresholdMinutes) *
    60 *
    1000;

  const breached = remainingMs < 0 && !isClosed;

  let risk = "on-track";
  if (isClosed) risk = "resolved";
  else if (breached) risk = "breached";
  else if (remainingMs <= warningThresholdMs) risk = "at-risk";

  return {
    targetHours,
    deadlineAt,
    remainingMs,
    breached,
    risk,
  };
};

const attachIncidentSla = async (incident, policy) => {
  const source = incident.toObject ? incident.toObject() : incident;
  const sla = evaluateIncidentSla(source, policy);
  return { ...source, sla };
};

export { getActiveSlaPolicy, evaluateIncidentSla, attachIncidentSla };
