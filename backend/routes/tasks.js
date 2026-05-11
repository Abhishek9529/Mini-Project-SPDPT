const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Progress = require("../models/Progress");
const ActionPlan = require("../models/ActionPlan");

const getGoalTaskFilter = (goalId) => ({
  goalId,
  subjectId: null,
  taskType: { $ne: "lecture-subtask" }
});

// CREATE TASK
router.post("/", async (req, res) => {
  try {
    // --- Server-side validation for taskTitle ---
    const { taskTitle, studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({ error: "studentId is required." });
    }
    if (!taskTitle || !taskTitle.trim()) {
      return res.status(400).json({ error: "Task title is required." });
    }
    if (/^\d+$/.test(taskTitle.trim())) {
      return res.status(400).json({ error: "Task title cannot be only numbers. Please enter a meaningful task name." });
    }
    if (taskTitle.trim().length < 3) {
      return res.status(400).json({ error: "Task title must be at least 3 characters." });
    }

    // Check duplicate logic for the single daily lecture task.
    // Lecture sub-tasks intentionally allow multiple tasks for the same subject/day.
    const isLectureSubtask = req.body.taskType === "lecture-subtask";
    if (req.body.subjectId && req.body.date && !isLectureSubtask) {
      const dayStart = new Date(req.body.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(req.body.date);
      dayEnd.setHours(23, 59, 59, 999);

      const existingTask = await Task.findOne({
        studentId: req.body.studentId,
        subjectId: req.body.subjectId,
        date: { $gte: dayStart, $lte: dayEnd },
        taskType: { $ne: "lecture-subtask" }
      });

      if (existingTask) {
        return res.status(200).json({
          message: "Task already exists",
          task: existingTask
        });
      }
    }

    const task = new Task(req.body);
    await task.save();

    // AUTO PROGRESS UPDATE on create (if task linked to goal)
    if (task.goalId) {
      const goalTaskFilter = getGoalTaskFilter(task.goalId);
      const totalTasks = await Task.countDocuments(goalTaskFilter);
      const completedTasks = await Task.countDocuments({ ...goalTaskFilter, isCompleted: true });
      const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      await Progress.findOneAndUpdate(
        { studentId: task.studentId, goalId: task.goalId },
        { percentage, updatedAt: Date.now() },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({
      message: "Task created successfully",
      task
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CHECK IF TASK EXISTS FOR A SUBJECT ON A SPECIFIC DATE
// Endpoint: GET /api/tasks/check/:studentId/:subjectId/:date
// Returns the task if it exists, used by timetable checkbox
router.get("/check/:studentId/:subjectId/:date", async (req, res) => {
  try {
    const { studentId, subjectId, date } = req.params;

    // Build date range for the entire day (00:00:00 to 23:59:59)
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const task = await Task.findOne({
      studentId,
      subjectId,
      date: { $gte: dayStart, $lte: dayEnd },
      taskType: { $ne: "lecture-subtask" }
    });

    if (task) {
      return res.status(200).json({ exists: true, task });
    }

    res.status(200).json({ exists: false, task: null });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SUB-TASKS BY SUBJECT AND DATE
// Endpoint: GET /api/tasks/subject/:studentId/:subjectId/:date
// Returns all tasks for a specific subject on a specific date, sorted by creation date
router.get("/subject/:studentId/:subjectId/:date", async (req, res) => {
  console.log("Subject endpoint hit with params:", req.params);
  try {
    const { studentId, subjectId, date } = req.params;

    // Validate ObjectId format for studentId and subjectId
    if (!studentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: "Invalid student ID format"
      });
    }

    if (!subjectId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: "Invalid subject ID format"
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        error: "Invalid date format. Expected YYYY-MM-DD"
      });
    }

    // Build date range for the entire day (00:00:00 to 23:59:59)
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Check if date is valid
    if (isNaN(dayStart.getTime())) {
      return res.status(400).json({
        error: "Invalid date value"
      });
    }

    // Fetch tasks filtered by studentId, subjectId, and date range
    const tasks = await Task.find({
      studentId,
      subjectId,
      taskType: "lecture-subtask",
      date: { $gte: dayStart, $lte: dayEnd }
    }).sort({ createdAt: 1 }); // Sort by creation date ascending

    res.status(200).json({
      message: "Sub-tasks retrieved successfully",
      count: tasks.length,
      tasks
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
console.log("Subject route registered: GET /subject/:studentId/:subjectId/:date");

// Simple test route
router.get("/subject-test", (req, res) => {
  res.json({ message: "Subject test route works!" });
});

// GET ALL TASKS BY STUDENT ID
// Endpoint: GET /api/tasks/:studentId
// Returns all tasks belonging to a specific student
// NOTE: This route must be defined AFTER all specific routes to avoid catching them
router.get("/:studentId", async (req, res) => {
  console.log("/:studentId route hit with param:", req.params.studentId);
  try {
    const { studentId } = req.params;

    // Validate ObjectId format
    if (!studentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: "Invalid student ID format"
      });
    }

    const tasks = await Task.find({ studentId }).populate("goalId");

    res.status(200).json({
      message: "Tasks retrieved successfully",
      count: tasks.length,
      tasks
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE TASK
// Endpoint: PUT /api/tasks/:id
// Updates task details by its ID
router.put("/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        error: "Task not found"
      });
    }

    // AUTO PROGRESS UPDATE (if task linked to goal)
    if (updatedTask.goalId) {
      const goalTaskFilter = getGoalTaskFilter(updatedTask.goalId);
      const totalTasks = await Task.countDocuments(goalTaskFilter);
      const completedTasks = await Task.countDocuments({ ...goalTaskFilter, isCompleted: true });
      const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      await Progress.findOneAndUpdate(
        { studentId: updatedTask.studentId, goalId: updatedTask.goalId },
        { percentage, updatedAt: Date.now() },
        { upsert: true, new: true }
      );
    }

    // SYNC ActionPlan step.isDone when task completion changes
    if (updatedTask.actionPlanId) {
      const plan = await ActionPlan.findById(updatedTask.actionPlanId);
      if (plan) {
        // Find the step whose taskId matches this task
        const step = plan.steps.find(
          (s) => s.taskId && s.taskId.toString() === updatedTask._id.toString()
        );
        if (step) {
          step.isDone = updatedTask.isCompleted;
          await plan.save();
        }
      }
    }

    res.json({
      message: "Task updated and progress auto-calculated",
      task: updatedTask
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE TASK
// Endpoint: DELETE /api/tasks/:id
// Permanently removes a task from the database
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: "Invalid task ID format"
      });
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({
        error: "Task not found"
      });
    }

    if (deletedTask.actionPlanId) {
      const plan = await ActionPlan.findById(deletedTask.actionPlanId);
      if (plan) {
        const step = plan.steps.find(
          (s) => s.taskId && s.taskId.toString() === deletedTask._id.toString()
        );

        if (step) {
          plan.steps.pull(step._id);

          if (plan.steps.length === 0) {
            await ActionPlan.findByIdAndDelete(plan._id);
          } else {
            await plan.save();
          }
        }
      }
    }

    if (deletedTask.goalId) {
      const goalTaskFilter = getGoalTaskFilter(deletedTask.goalId);
      const totalTasks = await Task.countDocuments(goalTaskFilter);
      const completedTasks = await Task.countDocuments({ ...goalTaskFilter, isCompleted: true });
      const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      await Progress.findOneAndUpdate(
        { studentId: deletedTask.studentId, goalId: deletedTask.goalId },
        { percentage, updatedAt: Date.now() },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      message: "Task deleted successfully",
      task: deletedTask
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
