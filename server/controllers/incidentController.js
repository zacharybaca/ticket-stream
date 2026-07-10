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

/**
 * @swagger
 * /api/incidents:
 *   get:
 *     summary: List incidents
 *     tags: [Incidents]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number to return.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of incidents per page.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, investigating, monitoring, resolved, closed]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [p1, p2, p3, p4]
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [critical, high, medium, low]
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: string
 *           enum: [me]
 *         description: Filter incidents assigned to the current user.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Free-text search across title, description, code, application, and service.
 *     responses:
 *       200:
 *         description: Incidents returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IncidentListResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/incidents/summary:
 *   get:
 *     summary: Get incident summary metrics
 *     tags: [Incidents]
 *     responses:
 *       200:
 *         description: Incident summary returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IncidentSummaryResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/incidents/{id}:
 *   get:
 *     summary: Get an incident by ID
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Incident identifier.
 *     responses:
 *       200:
 *         description: Incident returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Incident not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/incidents:
 *   post:
 *     summary: Create an incident
 *     tags: [Incidents]
 *     parameters:
 *       - in: header
 *         name: X-CSRF-Token
 *         schema:
 *           type: string
 *         required: false
 *         description: Required when a valid jwt cookie is present on the request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - application
 *               - service
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [p1, p2, p3, p4]
 *               severity:
 *                 type: string
 *                 enum: [critical, high, medium, low]
 *               application:
 *                 type: string
 *               service:
 *                 type: string
 *               customer:
 *                 type: string
 *               environment:
 *                 type: string
 *                 enum: [production, staging, development]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Incident created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *       400:
 *         description: Invalid incident data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Role not allowed to create incidents
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/incidents/{id}:
 *   patch:
 *     summary: Update an incident
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Incident identifier.
 *       - in: header
 *         name: X-CSRF-Token
 *         schema:
 *           type: string
 *         required: false
 *         description: Required when a valid jwt cookie is present on the request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [p1, p2, p3, p4]
 *               severity:
 *                 type: string
 *                 enum: [critical, high, medium, low]
 *               application:
 *                 type: string
 *               service:
 *                 type: string
 *               customer:
 *                 type: string
 *               environment:
 *                 type: string
 *                 enum: [production, staging, development]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               assignee:
 *                 type: string
 *                 nullable: true
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Incident updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Role not allowed to update incidents
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Incident not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/incidents/{id}/status:
 *   patch:
 *     summary: Update an incident status
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Incident identifier.
 *       - in: header
 *         name: X-CSRF-Token
 *         schema:
 *           type: string
 *         required: false
 *         description: Required when a valid jwt cookie is present on the request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, investigating, monitoring, resolved, closed]
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Incident status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *       400:
 *         description: Missing or invalid status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Role not allowed to update incidents
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Incident not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/incidents/{id}/comments:
 *   post:
 *     summary: Add a comment to an incident
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Incident identifier.
 *       - in: header
 *         name: X-CSRF-Token
 *         schema:
 *           type: string
 *         required: false
 *         description: Required when a valid jwt cookie is present on the request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Incident comment added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *       400:
 *         description: Comment message is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Role not allowed to comment on incidents
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Incident not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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
