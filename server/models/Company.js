import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    domain: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: { type: String, trim: true, default: "" },
    industry: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

const Company = mongoose.model("Company", companySchema);

export default Company;
