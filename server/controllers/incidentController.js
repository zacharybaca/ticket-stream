import asyncHandler from "express-async-handler";
import Incident from "../models/Incident.js";
import { createNotification } from "../services/notificationService.js";
import {
  attachIncidentSla,
  evaluateIncidentSla,
  getActiveSlaPolicy,
} from "../services/slaService.js";

const createTimelineEntry = ({
  type,
  message,
  createdBy,
  from = "",
  to = "",
}) => ({
  type,
  message,
  createdBy,
  from,
  to,
});

const emitIncidentEvent = (req, eventType, incident, extra = {}) => {
  const io = req.app.get("io");
  if (!io) return;

  const payload = {
    type: eventType,
    incidentId: incident._id?.toString(),
    incidentCode: incident.incidentCode,
    title: incident.title,
    status: incident.status,
    priority: incident.priority,
    severity: incident.severity,
    application: incident.application,
    service: incident.service,
    assigneeId: incident.assignee?._id?.toString() || incident.assignee?.toString() || null,
    reportedById:
      incident.reportedBy?._id?.toString() || incident.reportedBy?.toString() || null,
    actor: req.user
      ? {
          id: req.user._id?.toString(),
          name: req.user.name,
          username: req.user.username,
        }
      : null,
    timestamp: new Date().toISOString(),
    ...extra,
  };

  io.emit("incident:updated", payload);
  io.to(`incident:${payload.incidentId}`).emit("incident:detail-updated", payload);

  if (payload.assigneeId) io.to(payload.assigneeId).emit("incident:user-updated", payload);
  if (payload.reportedById) io.to(payload.reportedById).emit("incident:user-updated", payload);
};

const createIncidentNotification = async ({ req, incident, type, title, message }) => {
  const io = req.app.get("io");
  const targetUserId = incident.assignee || incident.reportedBy;

  if (!targetUserId) return;

  await createNotification({
    io,
    userId: targetUserId,
    incidentId: incident._id,
    audience: "user",
    type,
    title,
    message,
    metadata: {
      incidentCode: incident.incidentCode,
      incidentId: incident._id,
      status: incident.status,
      priority: incident.priority,
      severity: incident.severity,
    },
    channels: {
      inApp: true,
      email: false,
      slack: false,
      webhook: false,
    },
  });
};

const listIncidents = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page || "1", 10);
  const limit = Number.parseInt(req.query.limit || "20", 10);
  const skip = (page - 1) * limit;

  const filters = {};

  if (req.query.status) filters.status = req.query.status;
  if (req.query.priority) filters.priority = req.query.priority;
  if (req.query.severity) filters.severity = req.query.severity;
  if (req.query.assignee === "me") filters.assignee = req.user._id;

  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search.trim(), "i");
    filters.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { incidentCode: searchRegex },
      { application: searchRegex },
      { service: searchRegex },
    ];
  }

  const [incidents, total, policy] = await Promise.all([
    Incident.find(filters)
      .populate("assignee", "name username email")
      .populate("reportedBy", "name username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Incident.countDocuments(filters),
    getActiveSlaPolicy(),
  ]);

  const incidentsWithSla = await Promise.all(
    incidents.map((incident) => attachIncidentSla(incident, policy)),
  );

  res.json({
    incidents: incidentsWithSla,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

const getIncidentSummary = asyncHandler(async (_req, res) => {
  const [statusSummary, prioritySummary, openCount, criticalCount] =
    await Promise.all([
      Incident.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Incident.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
      Incident.countDocuments({
        status: { $in: ["open", "investigating", "monitoring"] },
      }),
      Incident.countDocuments({
        severity: "critical",
        status: { $ne: "closed" },
      }),
    ]);

  res.json({
    statusSummary,
    prioritySummary,
    openCount,
    criticalCount,
  });
});

const getIncidentById = asyncHandler(async (req, res) => {
  const [incident, policy] = await Promise.all([
    Incident.findById(req.params.id)
      .populate("assignee", "name username email")
      .populate("reportedBy", "name username email")
      .populate("timeline.createdBy", "name username email"),
    getActiveSlaPolicy(),
  ]);

  if (!incident) {
    res.status(404);
    throw new Error("Incident not found");
  }

  res.json(await attachIncidentSla(incident, policy));
});

const getIncidentSla = asyncHandler(async (req, res) => {
  const [incident, policy] = await Promise.all([
    Incident.findById(req.params.id).lean(),
    getActiveSlaPolicy(),
  ]);

  if (!incident) {
    res.status(404);
    throw new Error("Incident not found");
  }

  res.json({
    incidentId: incident._id,
    incidentCode: incident.incidentCode,
    sla: evaluateIncidentSla(incident, policy),
  });
});

const createIncident = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    priority,
    severity,
    application,
    service,
    customer,
    environment,
    tags,
  } = req.body;

  if (!title || !description || !application || !service) {
    res.status(400);
    throw new Error(
      "title, description, application, and service are required",
    );
  }

  const incident = await Incident.create({
    title,
    description,
    priority,
    severity,
    application,
    service,
    customer,
    environment,
    tags: Array.isArray(tags) ? tags : [],
    reportedBy: req.user._id,
    timeline: [
      createTimelineEntry({
        type: "created",
        message: "Incident created",
        createdBy: req.user._id,
      }),
    ],
  });

  const [hydratedIncident, policy] = await Promise.all([
    Incident.findById(incident._id)
      .populate("assignee", "name username email")
      .populate("reportedBy", "name username email")
      .populate("timeline.createdBy", "name username email"),
    getActiveSlaPolicy(),
  ]);

  const incidentWithSla = await attachIncidentSla(hydratedIncident, policy);

  emitIncidentEvent(req, "incident-created", incidentWithSla);
  await createIncidentNotification({
    req,
    incident: incidentWithSla,
    type: "incident-created",
    title: `Incident ${incidentWithSla.incidentCode} created`,
    message: incidentWithSla.title,
  });

  res.status(201).json(incidentWithSla);
});

const updateIncident = asyncHandler(async (req, res) => {
  const incident = await Incident.findById(req.params.id);

  if (!incident) {
    res.status(404);
    throw new Error("Incident not found");
  }

  const editableFields = [
    "title",
    "description",
    "priority",
    "severity",
    "application",
    "service",
    "customer",
    "environment",
    "tags",
  ];

  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      incident[field] = req.body[field];
    }
  });

  let assignmentChanged = false;

  if (req.body.assignee !== undefined) {
    const previousAssignee = incident.assignee ? incident.assignee.toString() : "";
    const nextAssignee = req.body.assignee || "";
    assignmentChanged = previousAssignee !== nextAssignee;

    incident.assignee = req.body.assignee || null;

    incident.timeline.push(
      createTimelineEntry({
        type: "assignment",
        message: req.body.assignee
          ? "Incident assignee updated"
          : "Incident unassigned from current owner",
        createdBy: req.user._id,
        from: previousAssignee,
        to: nextAssignee,
      }),
    );
  }

  if (req.body.note) {
    incident.timeline.push(
      createTimelineEntry({
        type: "note",
        message: req.body.note,
        createdBy: req.user._id,
      }),
    );
  }

  const savedIncident = await incident.save();

  const [hydratedIncident, policy] = await Promise.all([
    Incident.findById(savedIncident._id)
      .populate("assignee", "name username email")
      .populate("reportedBy", "name username email")
      .populate("timeline.createdBy", "name username email"),
    getActiveSlaPolicy(),
  ]);

  const incidentWithSla = await attachIncidentSla(hydratedIncident, policy);

  emitIncidentEvent(req, "incident-updated", incidentWithSla);

  if (assignmentChanged) {
    await createIncidentNotification({
      req,
      incident: incidentWithSla,
      type: "incident-assigned",
      title: `Incident ${incidentWithSla.incidentCode} assignment updated`,
      message: incidentWithSla.assignee
        ? `Assigned to ${incidentWithSla.assignee.name || incidentWithSla.assignee.username}`
        : "Incident has been unassigned",
    });
  }

  res.json(incidentWithSla);
});

const updateIncidentStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  if (!status) {
    res.status(400);
    throw new Error("status is required");
  }

  const incident = await Incident.findById(req.params.id);
  if (!incident) {
    res.status(404);
    throw new Error("Incident not found");
  }

  const previousStatus = incident.status;
  incident.status = status;
  incident.timeline.push(
    createTimelineEntry({
      type: "status-change",
      message: note || `Status changed from ${previousStatus} to ${status}`,
      createdBy: req.user._id,
      from: previousStatus,
      to: status,
    }),
  );

  const savedIncident = await incident.save();

  const [hydratedIncident, policy] = await Promise.all([
    Incident.findById(savedIncident._id)
      .populate("assignee", "name username email")
      .populate("reportedBy", "name username email")
      .populate("timeline.createdBy", "name username email"),
    getActiveSlaPolicy(),
  ]);

  const incidentWithSla = await attachIncidentSla(hydratedIncident, policy);

  emitIncidentEvent(req, "incident-status-updated", incidentWithSla, {
    previousStatus,
    nextStatus: status,
  });

  await createIncidentNotification({
    req,
    incident: incidentWithSla,
    type: "incident-status-updated",
    title: `Incident ${incidentWithSla.incidentCode} status changed`,
    message: `${previousStatus} → ${status}`,
  });

  res.json(incidentWithSla);
});

const addIncidentComment = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(400);
    throw new Error("message is required");
  }

  const incident = await Incident.findById(req.params.id);
  if (!incident) {
    res.status(404);
    throw new Error("Incident not found");
  }

  incident.timeline.push(
    createTimelineEntry({
      type: "comment",
      message,
      createdBy: req.user._id,
    }),
  );

  const savedIncident = await incident.save();

  const [hydratedIncident, policy] = await Promise.all([
    Incident.findById(savedIncident._id)
      .populate("assignee", "name username email")
      .populate("reportedBy", "name username email")
      .populate("timeline.createdBy", "name username email"),
    getActiveSlaPolicy(),
  ]);

  const incidentWithSla = await attachIncidentSla(hydratedIncident, policy);

  emitIncidentEvent(req, "incident-comment-added", incidentWithSla);
  await createIncidentNotification({
    req,
    incident: incidentWithSla,
    type: "incident-comment-added",
    title: `New comment on ${incidentWithSla.incidentCode}`,
    message,
  });

  res.json(incidentWithSla);
});

export {
  addIncidentComment,
  createIncident,
  getIncidentById,
  getIncidentSla,
  getIncidentSummary,
  listIncidents,
  updateIncident,
  updateIncidentStatus,
};
