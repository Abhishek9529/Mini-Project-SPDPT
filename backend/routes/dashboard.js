const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");
const Goal = require("../models/Goal");
const Task = require("../models/Task");

const getGeneralTaskFilter = (studentId) => ({
  studentId,
  subjectId: null,
  taskType: { $ne: "lecture-subtask" }
});

// DASHBOARD SUMMARY
router.get("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const totalSubjects = await Subject.countDocuments({ studentId });
    const totalGoals = await Goal.countDocuments({ studentId });
    const generalTaskFilter = getGeneralTaskFilter(studentId);
    const totalTasks = await Task.countDocuments(generalTaskFilter);
    const completedTasks = await Task.countDocuments({
      ...generalTaskFilter,
      isCompleted: true
    });

    let overallProgress = 0;
    if (totalTasks > 0) {
      overallProgress = Math.round((completedTasks / totalTasks) * 100);
    }

    // Calculate today's pending tasks and overdue tasks
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayPendingTasks = await Task.countDocuments({
      ...generalTaskFilter,
      isCompleted: false,
      $or: [
        { date: null },
        { date: { $gte: todayStart.toISOString().split('T')[0], $lte: todayEnd.toISOString().split('T')[0] } }
      ]
    });

    const overdueTasks = await Task.countDocuments({
      ...generalTaskFilter,
      isCompleted: false,
      deadline: { $lt: todayStart.toISOString().split('T')[0] }
    });

    res.status(200).json({
      studentId,
      totalSubjects,
      totalGoals,
      totalTasks,
      completedTasks,
      overallProgress,
      todayPendingTasks,
      overdueTasks
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
