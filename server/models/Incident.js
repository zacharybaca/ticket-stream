import mongoose from "mongoose";

const timelineEntrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["created", "status-change", "assignment", "comment", "note"],
      default: "note",
    },
    message: { type: String, required: true, trim: true },
    from: { type: String, default: "" },
    to: { type: String, default: "" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const incidentSchema = new mongoose.Schema(
  {
    incidentCode: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["open", "investigating", "monitoring", "resolved", "closed"],
      default: "open",
      index: true,
    },
    priority: {
      type: String,
      enum: ["p1", "p2", "p3", "p4"],
      default: "p3",
      index: true,
    },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
      index: true,
    },
    application: { type: String, required: true, trim: true, index: true },
    service: { type: String, required: true, trim: true },
    customer: { type: String, default: "", trim: true },
    environment: {
      type: String,
      enum: ["production", "staging", "development"],
      default: "production",
    },
    tags: [{ type: String, trim: true }],
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    timeline: { type: [timelineEntrySchema], default: [] },
  },
  { timestamps: true },
);

incidentSchema.pre("validate", function (next) {
  if (!this.incidentCode) {
    const suffix = `${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 900 + 100)}`;
    this.incidentCode = `INC-${suffix}`;
  }
  next();
});

const Incident = mongoose.model("Incident", incidentSchema);

export default Incident;
