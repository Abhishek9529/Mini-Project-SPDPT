const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");

// CREATE SUBJECT
router.post("/", async (req, res) => {
  try {
    const { studentId, subjectName } = req.body;

    // --- Server-side validation ---
    if (!studentId) {
      return res.status(400).json({ error: "studentId is required." });
    }
    if (!subjectName || !subjectName.trim()) {
      return res.status(400).json({ error: "Subject name is required." });
    }
    if (/^\d+$/.test(subjectName.trim())) {
      return res.status(400).json({ error: "Subject name cannot be only numbers." });
    }
    if (subjectName.trim().length < 2) {
      return res.status(400).json({ error: "Subject name must be at least 2 characters." });
    }

    const subject = new Subject(req.body);
    await subject.save();

    res.status(201).json({
      message: "Subject added successfully",
      subject
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL SUBJECTS BY STUDENT ID
// Endpoint: GET /api/subjects/:studentId
// Returns all subjects belonging to a specific student
router.get("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    // Validate ObjectId format
    if (!studentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: "Invalid student ID format"
      });
    }

    const subjects = await Subject.find({ studentId });

    res.status(200).json({
      message: "Subjects retrieved successfully",
      count: subjects.length,
      subjects
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE SUBJECT
// Endpoint: PUT /api/subjects/:id
// Updates subject details by its ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: "Invalid subject ID format"
      });
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedSubject) {
      return res.status(404).json({
        error: "Subject not found"
      });
    }

    res.status(200).json({
      message: "Subject updated successfully",
      subject: updatedSubject
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE SUBJECT
// Endpoint: DELETE /api/subjects/:id
// Permanently removes a subject from the database
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: "Invalid subject ID format"
      });
    }

    const deletedSubject = await Subject.findByIdAndDelete(id);

    if (!deletedSubject) {
      return res.status(404).json({
        error: "Subject not found"
      });
    }

    res.status(200).json({
      message: "Subject deleted successfully",
      subject: deletedSubject
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
