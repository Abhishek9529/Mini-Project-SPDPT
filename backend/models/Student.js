const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const studentSchema = new Schema({
  // ===== Basic Info =====
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  branch: { type: String, default: "" },
  semester: { type: String, default: "" },
  collegeName: { type: String, default: "" },
  enrollmentNumber: { type: String, default: "" },

  // ===== Academic Info =====
  lastSemSGPA: { type: Number, default: 0 },
  MSC1: { type: Number, default: 0 },
  MSC2: { type: Number, default: 0 },
  lastYearResult: { type: String, default: "" },
  attendance: { type: Number, default: 0 },
  backlogs: { type: Number, default: 0 },

  // ===== Career Info =====
  careerGoal: { type: String, default: "" },
  technicalSkills: { type: [String], default: [] },
  softSkills: { type: [String], default: [] },
  certifications: { type: String, default: "" },
  projects: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  github: { type: String, default: "" },

  // ===== Performance (read-only, calculated elsewhere) =====
  academicProgress: { type: Number, default: 0 },
  skillProgress: { type: Number, default: 0 },
  productivityScore: { type: Number, default: 0 },
  taskStreak: { type: Number, default: 0 },

  // ===== Personal =====
  achievements: { type: String, default: "" },
  hobbies: { type: String, default: "" },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', studentSchema);