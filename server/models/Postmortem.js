import mongoose from "mongoose";

const actionItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    owner: { type: String, default: "", trim: true },
    dueDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["open", "in-progress", "done"],
      default: "open",
    },
  },
  { _id: false },
);

const postmortemSchema = new mongoose.Schema(
  {
    incident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incident",
      required: true,
      unique: true,
      index: true,
    },
    summary: { type: String, default: "", trim: true },
    impact: { type: String, default: "", trim: true },
    rootCause: { type: String, default: "", trim: true },
    timeline: { type: String, default: "", trim: true },
    lessonsLearned: { type: String, default: "", trim: true },
    actionItems: { type: [actionItemSchema], default: [] },
    exportMetadata: {
      lastExportedAt: { type: Date, default: null },
      format: { type: String, default: "" },
      exportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

const Postmortem = mongoose.model("Postmortem", postmortemSchema);

export default Postmortem;
