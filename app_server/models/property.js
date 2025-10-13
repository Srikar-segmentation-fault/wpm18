const mongoose = require("mongoose");
const PropertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    rent: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    images: [String],
    facilities: [String],
    description: String,
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Property", PropertySchema);
