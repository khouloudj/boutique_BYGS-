const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: String,
    address: {
      street: String,
      city: String,
      postalCode: String,
    },
    role: { type: String, default: "user", enum: ["user"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
