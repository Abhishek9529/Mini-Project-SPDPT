const express = require("express");
const router = express.Router();
const ActionPlan = require("../models/ActionPlan");
const Task = require("../models/Task");
const Progress = require("../models/Progress");

const getGoalTaskFilter = (goalId) => ({
  goalId,
  subjectId: null,
  taskType: { $ne: "lecture-subtask" }
});

// CREATE ACTION PLAN
// POST /api/actionPlans
// → Creates plan AND immediately creates a Task for every step
router.post("/", async (req, res) => {
  try {
    const { studentId, goalId, steps } = req.body;

    if (!studentId || !goalId || !steps || steps.length === 0) {
      return res.status(400).json({ error: "studentId, goalId and at least one step are required." });
    }

    // 1. Save plan first (with steps, no taskId yet)
    const actionPlan = new ActionPlan({
      studentId,
      goalId,
      steps: steps.map(s => ({ title: s.title, isDone: false })),
      status: "active"
    });
    await actionPlan.save();

    // 2. Create a Task for EVERY step immediately and store taskId back on the step
    for (const step of actionPlan.steps) {
      const task = new Task({
        studentId,
        goalId,
        actionPlanId: actionPlan._id,
        taskTitle: step.title,
        isCompleted: false
      });
      await task.save();
      step.taskId = task._id;
    }

    await actionPlan.save(); // save with taskIds populated

    // 3. Update progress (new tasks added = denominator increases)
    const goalTaskFilter = getGoalTaskFilter(goalId);
    const totalTasks = await Task.countDocuments(goalTaskFilter);
    const completedTasks = await Task.countDocuments({ ...goalTaskFilter, isCompleted: true });
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    await Progress.findOneAndUpdate(
      { studentId, goalId },
      { percentage, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "Action plan created successfully", actionPlan });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ACTION PLANS FOR A GOAL
// GET /api/actionPlans/goal/:goalId
router.get("/goal/:goalId", async (req, res) => {
  try {
    const { goalId } = req.params;
    const plans = await ActionPlan.find({ goalId });
    res.status(200).json({ actionPlans: plans });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TOGGLE STEP DONE/UNDONE  → marks linked Task as completed/incomplete
// PATCH /api/actionPlans/:planId/step/:stepId
// Body: { isDone: true | false }
router.patch("/:planId/step/:stepId", async (req, res) => {
  try {
    const { planId, stepId } = req.params;
    const { isDone } = req.body;

    const plan = await ActionPlan.findById(planId);
    if (!plan) return res.status(404).json({ error: "Action plan not found." });

    const step = plan.steps.id(stepId);
    if (!step) return res.status(404).json({ error: "Step not found." });

    // Update step isDone
    step.isDone = isDone;

    // Mark linked task as completed/incomplete (task was already created on plan save)
    if (step.taskId) {
      await Task.findByIdAndUpdate(step.taskId, { isCompleted: isDone });

      // Recalculate progress
      const goalTaskFilter = getGoalTaskFilter(plan.goalId);
      const totalTasks = await Task.countDocuments(goalTaskFilter);
      const completedTasks = await Task.countDocuments({ ...goalTaskFilter, isCompleted: true });
      const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      await Progress.findOneAndUpdate(
        { studentId: plan.studentId, goalId: plan.goalId },
        { percentage, updatedAt: Date.now() },
        { upsert: true, new: true }
      );
    }

    await plan.save();

    res.status(200).json({ message: "Step updated.", actionPlan: plan });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ACTION PLAN
// DELETE /api/actionPlans/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid action plan ID format." });
    }

    const deleted = await ActionPlan.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Action plan not found." });

    // Also delete all tasks created by this plan
    await Task.deleteMany({ actionPlanId: id });

    const goalTaskFilter = getGoalTaskFilter(deleted.goalId);
    const totalTasks = await Task.countDocuments(goalTaskFilter);
    const completedTasks = await Task.countDocuments({ ...goalTaskFilter, isCompleted: true });
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    await Progress.findOneAndUpdate(
      { studentId: deleted.studentId, goalId: deleted.goalId },
      { percentage, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Action plan deleted successfully." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
