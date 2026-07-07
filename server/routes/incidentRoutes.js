import express from "express";
import {
  addIncidentComment,
  createIncident,
  getIncidentById,
  getIncidentSla,
  getIncidentSummary,
  listIncidents,
  updateIncident,
  updateIncidentStatus,
} from "../controllers/incidentController.js";
import {
  getPostmortemByIncident,
  updatePostmortemExportMetadata,
  upsertPostmortem,
} from "../controllers/postmortemController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/rbac.js";

const router = express.Router();

router.use(protect, authorize("incident:read"));

router.get("/summary", getIncidentSummary);
router.route("/").get(listIncidents).post(authorize("incident:write"), createIncident);
router.route("/:id").get(getIncidentById).patch(authorize("incident:write"), updateIncident);
router.get("/:id/sla", getIncidentSla);
router.patch("/:id/status", authorize("incident:write"), updateIncidentStatus);
router.post("/:id/comments", authorize("incident:write"), addIncidentComment);

router.get("/:id/postmortem", authorize("postmortem:read"), getPostmortemByIncident);
router.put("/:id/postmortem", authorize("postmortem:write"), upsertPostmortem);
router.patch(
  "/:id/postmortem/export",
  authorize("postmortem:write"),
  updatePostmortemExportMetadata,
);

export default router;
