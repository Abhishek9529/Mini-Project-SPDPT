const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: String,       // Sleep, Study, Skills etc
  hours: Number,
  note: String        // optional reflection
});

const myDaySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  },

  date: {
    type: Date,
    required: true
  },

  categories: [categorySchema],

  totalHours: Number,        // auto calculate (for validation)

  productivityScore: Number, // future AI use

  mood: String,              // optional future (happy, tired etc)

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("MyDay", myDaySchema);
