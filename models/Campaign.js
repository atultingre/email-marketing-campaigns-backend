const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    campaignType: {
      type: String,
      enum: ["CL", "TT", "GG", "FS", "IT", "CR", "DA", "JM"],
      required: true,
    },
    campaignCode: {
      type: String,
      required: true,
    },
    landingPages: {
      type: Number,
      required: true,
    },
    campaignCreatedBy: {
      type: String,
      enum: ["Atul Tingre", "Nandkishor Kadam", "Avinash Mahajan"],
      required: true,
    },
    campaignAssignedTo: {
      type: String,
      enum: ["Atul Tingre", "Nandkishor Kadam", "Avinash Mahajan"],
    },
    status: {
      type: String,
      enum: ["Not yet started", "In progress", "Completed"],
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);
