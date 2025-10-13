// app_server/models/user.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    role: {
      type: String,
      enum: ["seeker", "owner"],
      default: "seeker",
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false,
    },
  },
  { timestamps: true, versionKey: false }
);

// Enforce unique index on email (safety for schema changes)
userSchema.index({ email: 1 }, { unique: true });

// Password verification helper
userSchema.methods.verifyPassword = async function (plainPassword) {
  try {
    return await bcrypt.compare(plainPassword, this.passwordHash);
  } catch (err) {
    console.error("Password compare failed:", err);
    return false;
  }
};

// Hide passwordHash in API responses / JSON outputs
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

// Export the model
module.exports = mongoose.model("User", userSchema);
