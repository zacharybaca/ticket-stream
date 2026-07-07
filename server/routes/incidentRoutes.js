import express from "express";
import {
  addIncidentComment,
  createIncident,
  getIncidentById,
  getIncidentSummary,
  listIncidents,
  updateIncident,
  updateIncidentStatus,
} from "../controllers/incidentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/summary", getIncidentSummary);
router.route("/").get(listIncidents).post(createIncident);
router.route("/:id").get(getIncidentById).patch(updateIncident);
router.patch("/:id/status", updateIncidentStatus);
router.post("/:id/comments", addIncidentComment);

export default router;
