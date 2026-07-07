import mongoose from "mongoose";

const slaPolicySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    priorities: {
      p1: { type: Number, default: 1, min: 1 },
      p2: { type: Number, default: 4, min: 1 },
      p3: { type: Number, default: 12, min: 1 },
      p4: { type: Number, default: 24, min: 1 },
    },
    warningThresholdMinutes: { type: Number, default: 30, min: 1 },
  },
  { timestamps: true },
);

const SlaPolicy = mongoose.model("SlaPolicy", slaPolicySchema);

export default SlaPolicy;
