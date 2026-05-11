const express = require("express");
const router = express.Router();
const Progress = require("../models/Progress");

// CREATE or UPDATE PROGRESS
router.post("/", async (req, res) => {
  try {
    const { studentId, goalId, percentage } = req.body;

    let progress = await Progress.findOne({ studentId, goalId });

    if (progress) {
      progress.percentage = percentage;
      progress.updatedAt = Date.now();
      await progress.save();
    } else {
      progress = new Progress({ studentId, goalId, percentage });
      await progress.save();
    }

    res.status(200).json({
      message: "Progress updated",
      progress
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
