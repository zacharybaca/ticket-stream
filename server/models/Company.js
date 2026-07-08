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
      validate: {
        validator: (v) =>
          /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(
            v,
          ),
        message: (props) =>
          `${props.value} is not a valid domain (e.g. example.com)`,
      },
    },
    description: { type: String, trim: true, default: "" },
    industry: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

const Company = mongoose.model("Company", companySchema);

export default Company;
