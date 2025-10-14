const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    filename: { type: String, default: null },
    mimetype: { type: String, default: null },
    size: { type: Number, default: null },
  },
  { _id: false }
);

const SharingOptionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      enum: ["single", "double", "triple", "quad", "multi"],
      required: true,
    },
    label: { type: String, required: true }, // e.g., "Double Occupancy (2 people)"
    capacity: { type: Number, required: true }, // persons per unit
    totalUnits: { type: Number, default: 0, min: 0 },
    availableUnits: { type: Number, default: 0, min: 0 },
    pricePerPerson: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const PropertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },

    // A general/base rent (optional if you rely purely on sharingOptions pricing)
    rent: { type: Number, default: 0, min: 0 },

    facilities: [{ type: String, trim: true }],
    description: { type: String, default: "" },

    images: { type: [ImageSchema], default: [] },

    // Sharing basis options (what user can check availability for)
    sharingOptions: { type: [SharingOptionSchema], default: [] },
  },
  { timestamps: true }
);

// Small quality-of-life indexes
PropertySchema.index({ owner: 1, createdAt: -1 });
PropertySchema.index({ city: 1, createdAt: -1 });

module.exports = mongoose.model("Property", PropertySchema);
