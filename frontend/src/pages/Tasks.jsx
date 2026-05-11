import { useEffect, useState } from "react";
import API from "../services/api";
import "./Tasks.css";

const isSubjectTask = (task) => {
    return !!task?.subjectId || task?.taskType === "lecture-subtask";
};

function TaskGoalPicker({ goals, value, onChange, disabled }) {
    const [open, setOpen] = useState(false);
    const selectedGoal = goals.find(goal => goal._id === value);

    const handleToggle = () => {
        if (!disabled) setOpen(current => !current);
    };

    const handleChange = (goalId) => {
        onChange(goalId);
        setOpen(false);
    };

    return (
        <div className={`task-goal-picker ${disabled ? "disabled" : ""}`}>
            <button
                type="button"
                className="task-goal-picker-toggle"
                onClick={handleToggle}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span>{selectedGoal ? selectedGoal.title : "-- Connect to Goal (Optional) --"}</span>
                <span className="task-goal-picker-arrow">v</span>
            </button>

            {open && (
                <div className="task-goal-picker-options" role="listbox">
                    <button
                        type="button"
                        className={`task-goal-picker-option ${!value ? "selected" : ""}`}
                        onClick={() => handleChange("")}
                    >
                        -- Connect to Goal (Optional) --
                    </button>

                    {goals.map(goal => (
                        <button
                            key={goal._id}
                            type="button"
                            className={`task-goal-picker-option ${value === goal._id ? "selected" : ""}`}
                            onClick={() => handleChange(goal._id)}
                        >
                            {goal.title}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [taskTitle, setTaskTitle] = useState("");
    const [goals, setGoals] = useState([]);
    const [selectedGoalId, setSelectedGoalId] = useState("");
    const [customGoal, setCustomGoal] = useState("");
    const [deadline, setDeadline] = useState("");
    const [loading, setLoading] = useState(true);

    const student = JSON.parse(localStorage.getItem("student"));

    // Fetch tasks and goals on mount
    useEffect(() => {
        if (!student) return;

        Promise.all([
            API.get(`/tasks/${student._id}`),
            API.get(`/goals/${student._id}`)
        ])
            .then(([tasksRes, goalsRes]) => {
                const generalTasks = (tasksRes.data.tasks || []).filter(task => !isSubjectTask(task));
                setTasks(generalTasks);
                setGoals(goalsRes.data.goals);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            });
    }, []);

    // Add new task
    const handleAddTask = async (e) => {
        e.preventDefault();

        const trimmedTitle = taskTitle.trim();
        if (!trimmedTitle) {
            alert("Task title is required.");
            return;
        }
        if (/^\d+$/.test(trimmedTitle)) {
            alert("Task title cannot be only numbers. Please enter a meaningful task name.");
            return;
        }
        if (trimmedTitle.length < 3) {
            alert("Task title must be at least 3 characters.");
            return;
        }

        try {
            let finalGoalId = selectedGoalId;

            // If custom goal is entered, create it first
            if (customGoal.trim()) {
                const goalRes = await API.post("/goals", {
                    studentId: student._id,
                    title: customGoal.trim(),
                    type: "academic" // Default type for quick add
                });
                finalGoalId = goalRes.data.goal._id;

                // Update local goals list
                setGoals([...goals, goalRes.data.goal]);
            }

            const res = await API.post("/tasks", {
                studentId: student._id,
                taskTitle: trimmedTitle,
                goalId: finalGoalId || null,
                deadline: deadline || null
            });

            // Add new task to list
            // Determine the goal object for immediate display if we just used one
            const newTask = res.data.task;
            if (finalGoalId) {
                // If we linked a goal, we need to populate it manually for the frontend state
                // because the POST response might not have it populated deep enough or at all
                const linkedGoal = goals.find(g => g._id === finalGoalId) || { _id: finalGoalId, title: customGoal.trim() };
                newTask.goalId = linkedGoal;
            }

            setTasks([...tasks, newTask]);

            // Clear form
            setTaskTitle("");
            setSelectedGoalId("");
            setCustomGoal("");
            setDeadline("");

            alert("Task added successfully");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to add task");
        }
    };

    // Toggle task completion
    const handleToggleComplete = async (task) => {
        try {
            const res = await API.put(`/tasks/${task._id}`, {
                isCompleted: !task.isCompleted
            });

            // Update task in list
            setTasks(tasks.map(t => {
                if (t._id === task._id) {
                    // Preserve populated goal info since PUT response might not re-populate it
                    const updated = res.data.task;
                    updated.goalId = t.goalId;
                    return updated;
                }
                return t;
            }));
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update task");
        }
    };

    // Delete task
    const handleDeleteTask = async (taskId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this task?");

        if (!confirmDelete) return;

        try {
            await API.delete(`/tasks/${taskId}`);

            // Remove task from list
            setTasks(tasks.filter(t => t._id !== taskId));

            alert("Task deleted successfully");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to delete task");
        }
    };

    if (loading) return <h3 className="loading-text">Loading tasks...</h3>;

    const getTaskGoal = (task) => {
        if (!task.goalId) {
            return { key: "no-goal", title: "No Goal" };
        }

        if (typeof task.goalId === "object") {
            return {
                key: task.goalId._id || task.goalId.title || "linked-goal",
                title: task.goalId.title || "Linked Goal"
            };
        }

        const matchingGoal = goals.find(goal => goal._id === task.goalId);
        return {
            key: task.goalId,
            title: matchingGoal?.title || "Linked Goal"
        };
    };

    const goalSections = tasks.reduce((sections, task) => {
        const goal = getTaskGoal(task);
        const existingSection = sections.find(section => section.key === goal.key);

        if (existingSection) {
            existingSection.tasks.push(task);
        } else {
            sections.push({ ...goal, tasks: [task] });
        }

        return sections;
    }, []);

    const getStatusGroups = (sectionTasks) => {
        const now = new Date();

        return [
            {
                key: "overdue",
                title: "Overdue Tasks",
                emptyMessage: "No overdue tasks.",
                tasks: sectionTasks.filter(task => !task.isCompleted && task.deadline && new Date(task.deadline) < now)
            },
            {
                key: "pending",
                title: "Pending Tasks",
                emptyMessage: "No pending tasks.",
                tasks: sectionTasks.filter(task => !task.isCompleted && !(task.deadline && new Date(task.deadline) < now))
            },
            {
                key: "completed",
                title: "Successful Tasks",
                emptyMessage: "No successful tasks yet.",
                tasks: sectionTasks.filter(task => task.isCompleted)
            }
        ];
    };

    const renderTaskItem = (task) => (
        <li
            key={task._id}
            className={`task-item ${task.isCompleted ? "completed" : ""}`}
        >
            <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={() => handleToggleComplete(task)}
            />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <span className={`task-title ${task.isCompleted ? "done" : ""}`}>
                    {task.taskTitle}
                </span>
                {task.goalId && (
                    <span style={{ fontSize: "0.8rem", color: "var(--accent-primary)", marginTop: "0.2rem" }}>
                        Goal: {getTaskGoal(task).title}
                    </span>
                )}
                {task.deadline && (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                        Due: {new Date(task.deadline).toISOString().slice(0, 10)}
                        {(() => {
                            const isOverdue = new Date() > new Date(task.deadline);
                            return isOverdue && !task.isCompleted
                                ? <span style={{ color: "var(--accent-red)", marginLeft: "0.5rem", fontWeight: "bold" }}>Overdue</span>
                                : null;
                        })()}
                    </span>
                )}
            </div>
            <span className={`task-status ${task.isCompleted ? "completed-status" : ""}`}>
                {task.isCompleted ? "Completed" : "Pending"}
            </span>
            <button
                className="delete-btn"
                onClick={() => handleDeleteTask(task._id)}
                title="Delete task"
            >
                Delete
            </button>
        </li>
    );

    return (
        <div className="tasks-page">
            <h2>My Tasks</h2>

            {/* Add Task Form */}
            <form className="task-form" onSubmit={handleAddTask}>
                <input
                    placeholder="Task Title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                />

                <TaskGoalPicker
                    goals={goals}
                    value={selectedGoalId}
                    disabled={!!customGoal}
                    onChange={(goalId) => {
                        setSelectedGoalId(goalId);
                        if (goalId) setCustomGoal(""); // Clear custom if selecting existing
                    }}
                />

                <input
                    placeholder="Or New Goal Name"
                    value={customGoal}
                    onChange={(e) => {
                        setCustomGoal(e.target.value);
                        if (e.target.value) setSelectedGoalId(""); // Clear selection if typing custom
                    }}
                    disabled={!!selectedGoalId}
                    className="task-custom-goal-input"
                />

                <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    title="Deadline (Optional)"
                    className="task-deadline-input"
                />

                <button type="submit">Add Task</button>
            </form>

            {/* Tasks List */}
            {tasks.length === 0 ? (
                <p className="empty-message">No general tasks found. Subject sub-tasks are managed on the dashboard.</p>
            ) : (
                <div className="goal-task-sections">
                    {goalSections.map(section => (
                        <section key={section.key} className="task-section task-section--goal">
                            <div className="task-section-header">
                                <h3>{section.title}</h3>
                                <span className="task-count-badge">{section.tasks.length}</span>
                            </div>
                            <div className="goal-status-sections">
                                {getStatusGroups(section.tasks).map(statusSection => (
                                    <section
                                        key={`${section.key}-${statusSection.key}`}
                                        className={`task-status-section task-section--${statusSection.key}`}
                                    >
                                        <div className="task-status-section-header">
                                            <h4>{statusSection.title}</h4>
                                            <span className="task-count-badge">{statusSection.tasks.length}</span>
                                        </div>
                                        {statusSection.tasks.length === 0 ? (
                                            <p className="empty-message task-status-empty">{statusSection.emptyMessage}</p>
                                        ) : (
                                            <ul className="task-list">
                                                {statusSection.tasks.map(renderTaskItem)}
                                            </ul>
                                        )}
                                    </section>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Tasks;
