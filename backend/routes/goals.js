const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");

const VALID_GOAL_TYPES = ["skill", "academic", "exam", "longterm", "midterm", "shortterm"];

// CREATE GOAL
router.post("/", async (req, res) => {
  try {
    const { studentId, title, type, endDate } = req.body;

    // --- Server-side validation ---
    if (!studentId) {
      return res.status(400).json({ error: "studentId is required." });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Goal title is required." });
    }
    if (/^\d+$/.test(title.trim())) {
      return res.status(400).json({ error: "Goal title cannot be only numbers." });
    }
    if (title.trim().length < 3) {
      return res.status(400).json({ error: "Goal title must be at least 3 characters." });
    }
    if (type && !VALID_GOAL_TYPES.includes(type)) {
      return res.status(400).json({ error: `Invalid goal type. Must be one of: ${VALID_GOAL_TYPES.join(", ")}.` });
    }
    if (endDate) {
      const parsedDate = new Date(endDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: "Invalid deadline date format." });
      }
    }

    const goal = new Goal(req.body);
    await goal.save();

    res.status(201).json({
      message: "Goal created successfully",
      goal
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL GOALS BY STUDENT ID
// Endpoint: GET /api/goals/:studentId
// Returns all goals belonging to a specific student
router.get("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    // Validate ObjectId format
    if (!studentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: "Invalid student ID format"
      });
    }

    const goals = await Goal.find({ studentId });

    res.status(200).json({
      message: "Goals retrieved successfully",
      count: goals.length,
      goals
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE GOAL
// Endpoint: PUT /api/goals/:id
// Updates goal details by its ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: "Invalid goal ID format"
      });
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedGoal) {
      return res.status(404).json({
        error: "Goal not found"
      });
    }

    res.status(200).json({
      message: "Goal updated successfully",
      goal: updatedGoal
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE GOAL
// Endpoint: DELETE /api/goals/:id
// Permanently removes a goal from the database
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: "Invalid goal ID format"
      });
    }

    const deletedGoal = await Goal.findByIdAndDelete(id);

    if (!deletedGoal) {
      return res.status(404).json({
        error: "Goal not found"
      });
    }

    res.status(200).json({
      message: "Goal deleted successfully",
      goal: deletedGoal
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
