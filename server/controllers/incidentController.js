import asyncHandler from "express-async-handler";
import Incident from "../models/Incident.js";

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

  const [incidents, total] = await Promise.all([
    Incident.find(filters)
      .populate("assignee", "name username email")
      .populate("reportedBy", "name username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Incident.countDocuments(filters),
  ]);

  res.json({
    incidents,
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
      Incident.aggregate([
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
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
  const incident = await Incident.findById(req.params.id)
    .populate("assignee", "name username email")
    .populate("reportedBy", "name username email")
    .populate("timeline.createdBy", "name username email");

  if (!incident) {
    res.status(404);
    throw new Error("Incident not found");
  }

  res.json(incident);
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

  const hydratedIncident = await Incident.findById(incident._id)
    .populate("assignee", "name username email")
    .populate("reportedBy", "name username email")
    .populate("timeline.createdBy", "name username email");

  res.status(201).json(hydratedIncident);
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

  if (req.body.assignee !== undefined) {
    const previousAssignee = incident.assignee
      ? incident.assignee.toString()
      : "";
    incident.assignee = req.body.assignee || null;

    incident.timeline.push(
      createTimelineEntry({
        type: "assignment",
        message: req.body.assignee
          ? "Incident assignee updated"
          : "Incident unassigned from current owner",
        createdBy: req.user._id,
        from: previousAssignee,
        to: req.body.assignee || "",
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
  const hydratedIncident = await Incident.findById(savedIncident._id)
    .populate("assignee", "name username email")
    .populate("reportedBy", "name username email")
    .populate("timeline.createdBy", "name username email");

  res.json(hydratedIncident);
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
  const hydratedIncident = await Incident.findById(savedIncident._id)
    .populate("assignee", "name username email")
    .populate("reportedBy", "name username email")
    .populate("timeline.createdBy", "name username email");

  res.json(hydratedIncident);
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
  const hydratedIncident = await Incident.findById(savedIncident._id)
    .populate("assignee", "name username email")
    .populate("reportedBy", "name username email")
    .populate("timeline.createdBy", "name username email");

  res.json(hydratedIncident);
});

export {
  addIncidentComment,
  createIncident,
  getIncidentById,
  getIncidentSummary,
  listIncidents,
  updateIncident,
  updateIncidentStatus,
};
