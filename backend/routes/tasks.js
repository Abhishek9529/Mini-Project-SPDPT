const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Progress = require("../models/Progress");
const ActionPlan = require("../models/ActionPlan");

// Helper: get filter for tasks linked to a specific goal
const getGoalTaskFilter = (goalId) => ({ goalId });

// CREATE TASK
router.post("/", async (req, res) => {
  try {
    const { taskTitle, studentId } = req.body;

    // --- Server-side validation ---
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

// GET ALL TASKS BY STUDENT ID
// Endpoint: GET /api/tasks/:studentId
// Returns all tasks belonging to a specific student
router.get("/:studentId", async (req, res) => {
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
