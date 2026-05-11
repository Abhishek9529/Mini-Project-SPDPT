const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  isDone: {
    type: Boolean,
    default: false
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    default: null
  }
}, { _id: true });

const actionPlanSchema = new mongoose.Schema({
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

  steps: [stepSchema],

  status: {
    type: String,
    default: "active"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ActionPlan", actionPlanSchema);

