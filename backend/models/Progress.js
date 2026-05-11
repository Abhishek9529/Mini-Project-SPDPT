const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Goal",
    required: true
  },

  percentage: {
    type: Number,
    default: 0
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Progress", progressSchema);
