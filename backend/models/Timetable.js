const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },

    day: {
        type: String,
        required: true
    },

    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject"
        }
    ],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound unique index to ensure one timetable entry per day per student
timetableSchema.index({ studentId: 1, day: 1 }, { unique: true });

module.exports = mongoose.model("Timetable", timetableSchema);
