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
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/summary", getIncidentSummary);
router
  .route("/")
  .get(listIncidents)
  .post(authorize("admin", "responder"), createIncident);
router
  .route("/:id")
  .get(getIncidentById)
  .patch(authorize("admin", "responder"), updateIncident);
router.patch(
  "/:id/status",
  authorize("admin", "responder"),
  updateIncidentStatus,
);
router.post(
  "/:id/comments",
  authorize("admin", "responder"),
  addIncidentComment,
);

export default router;
