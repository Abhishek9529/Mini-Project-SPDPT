const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: ["skill", "exam", "academic", "longterm", "midterm", "shortterm"],
    required: true
  },

  startDate: Date,

  endDate: Date,

  status: {
    type: String,
    default: "ongoing"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Goal", goalSchema);
