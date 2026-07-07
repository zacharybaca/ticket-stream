import asyncHandler from "express-async-handler";
import Incident from "../models/Incident.js";
import Postmortem from "../models/Postmortem.js";

const getPostmortemByIncident = asyncHandler(async (req, res) => {
  const incident = await Incident.findById(req.params.id).select("_id status");
  if (!incident) {
    res.status(404);
    throw new Error("Incident not found");
  }

  const postmortem = await Postmortem.findOne({ incident: incident._id })
    .populate("updatedBy", "name username email")
    .populate("exportMetadata.exportedBy", "name username email");

  res.json({ incidentId: incident._id, postmortem });
});

const upsertPostmortem = asyncHandler(async (req, res) => {
  const incident = await Incident.findById(req.params.id).select("_id status");
  if (!incident) {
    res.status(404);
    throw new Error("Incident not found");
  }

  const payload = {
    summary: req.body.summary || "",
    impact: req.body.impact || "",
    rootCause: req.body.rootCause || "",
    timeline: req.body.timeline || "",
    lessonsLearned: req.body.lessonsLearned || "",
    actionItems: Array.isArray(req.body.actionItems) ? req.body.actionItems : [],
    updatedBy: req.user._id,
  };

  const postmortem = await Postmortem.findOneAndUpdate(
    { incident: incident._id },
    { $set: payload },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )
    .populate("updatedBy", "name username email")
    .populate("exportMetadata.exportedBy", "name username email");

  res.json({ incidentId: incident._id, postmortem });
});

const updatePostmortemExportMetadata = asyncHandler(async (req, res) => {
  const { format = "json" } = req.body;

  const incident = await Incident.findById(req.params.id).select("_id");
  if (!incident) {
    res.status(404);
    throw new Error("Incident not found");
  }

  const postmortem = await Postmortem.findOneAndUpdate(
    { incident: incident._id },
    {
      $set: {
        "exportMetadata.lastExportedAt": new Date(),
        "exportMetadata.format": format,
        "exportMetadata.exportedBy": req.user._id,
        updatedBy: req.user._id,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )
    .populate("updatedBy", "name username email")
    .populate("exportMetadata.exportedBy", "name username email");

  res.json({ incidentId: incident._id, postmortem });
});

export {
  getPostmortemByIncident,
  upsertPostmortem,
  updatePostmortemExportMetadata,
};
