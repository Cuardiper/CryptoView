const mongoose = require("mongoose");

const trackerSchema = new mongoose.Schema({
  from: String,
  to: String,
  value: String,
  timestamp: Date,
  hash: { type: String, unique: true },
});

module.exports = mongoose.model("Tracker", trackerSchema);
