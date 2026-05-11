const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  subjectName: {
    type: String,
    required: true
  },

  semester: String,

  day: String,

  attendance: {
    type: Number,
    default: 0
  },

  examDate: Date,

  status: {
    type: String,
    default: "ongoing"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Subject", subjectSchema);
