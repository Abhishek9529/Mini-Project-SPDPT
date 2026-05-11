import { useEffect, useState } from "react";
import API from "../services/api";
import "./Goals.css";

const goalTypeOptions = [
    { value: "skill", label: "Skill" },
    { value: "academic", label: "Academic" },
    { value: "exam", label: "Exam" },
    { value: "longterm", label: "Long Term" },
    { value: "midterm", label: "Mid Term" },
    { value: "shortterm", label: "Short Term" }
];

function GoalTypePicker({ value, onChange, className = "" }) {
    const [open, setOpen] = useState(false);
    const selectedOption = goalTypeOptions.find(option => option.value === value) || goalTypeOptions[0];

    return (
        <div className={`goal-type-picker ${className}`}>
            <button
                type="button"
                className="goal-type-picker-toggle"
                onClick={() => setOpen(current => !current)}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span>{selectedOption.label}</span>
                <span className="goal-type-picker-arrow">v</span>
            </button>

            {open && (
                <div className="goal-type-picker-options" role="listbox">
                    {goalTypeOptions.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            className={`goal-type-picker-option ${value === option.value ? "selected" : ""}`}
                            onClick={() => {
                                onChange(option.value);
                                setOpen(false);
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function Goals() {
    const [goals, setGoals] = useState([]);
    const [title, setTitle] = useState("");
    const [type, setType] = useState("skill");
    const [deadline, setDeadline] = useState("");
    const [loading, setLoading] = useState(true);

    const [editingGoalId, setEditingGoalId] = useState(null);
    const [editFormData, setEditFormData] = useState({ title: "", type: "", status: "", endDate: "" });

    // ActionPlan state
    const [actionPlans, setActionPlans] = useState({}); // { goalId: actionPlan }
    const [showPlanForm, setShowPlanForm] = useState(null); // goalId whose form is open
    const [stepInputs, setStepInputs] = useState([""]); // step title inputs

    const student = JSON.parse(localStorage.getItem("student"));

    // --- Fetch ActionPlan for a given goalId ---
    const fetchActionPlan = async (goalId) => {
        try {
            const res = await API.get(`/actionPlans/goal/${goalId}`);
            const plans = res.data.actionPlans;
            if (plans && plans.length > 0) {
                setActionPlans(prev => ({ ...prev, [goalId]: plans[0] }));
            }
        } catch (err) {
            console.log("ActionPlan fetch error:", err);
        }
    };

    useEffect(() => {
        if (!student) return;

        API.get(`/goals/${student._id}`)
            .then(res => {
                const fetchedGoals = res.data.goals;
                setGoals(fetchedGoals);
                setLoading(false);

                // Fetch action plans for each goal
                fetchedGoals.forEach(goal => fetchActionPlan(goal._id));
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            });
    }, []);

    // --- Goal CRUD ---
    const handleAddGoal = async (e) => {
        e.preventDefault();

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            alert("Goal title is required.");
            return;
        }
        if (/^\d+$/.test(trimmedTitle)) {
            alert("Goal title cannot be only numbers. Please enter a meaningful goal name.");
            return;
        }
        if (trimmedTitle.length < 3) {
            alert("Goal title must be at least 3 characters.");
            return;
        }

        try {
            const res = await API.post("/goals", {
                studentId: student._id,
                title,
                type,
                endDate: deadline || undefined
            });

            setGoals([...goals, res.data.goal]);
            setTitle("");
            setType("skill");
            setDeadline("");
            alert("Goal added successfully");
        } catch (err) {
            alert(err.response?.data?.error || "Failed to add goal");
        }
    };

    const handleDeleteGoal = async (id) => {
        if (!window.confirm("Are you sure you want to delete this goal?")) return;
        try {
            await API.delete(`/goals/${id}`);
            setGoals(goals.filter(goal => goal._id !== id));
        } catch (err) {
            alert(err.response?.data?.error || "Failed to delete goal");
        }
    };

    const handleEditClick = (goal) => {
        setEditingGoalId(goal._id);
        setEditFormData({
            title: goal.title,
            type: goal.type,
            status: goal.status,
            endDate: goal.endDate ? new Date(goal.endDate).toISOString().split('T')[0] : ""
        });
    };

    const handleUpdateGoal = async (id) => {
        const trimmedTitle = (editFormData.title || "").trim();
        if (!trimmedTitle) {
            alert("Goal title is required.");
            return;
        }
        if (/^\d+$/.test(trimmedTitle)) {
            alert("Goal title cannot be only numbers.");
            return;
        }
        if (trimmedTitle.length < 3) {
            alert("Goal title must be at least 3 characters.");
            return;
        }
        try {
            const res = await API.put(`/goals/${id}`, { ...editFormData, title: trimmedTitle });
            setGoals(goals.map(goal => goal._id === id ? res.data.goal : goal));
            setEditingGoalId(null);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update goal");
        }
    };

    // --- ActionPlan ---
    const handleOpenPlanForm = (goalId) => {
        setShowPlanForm(goalId);
        setStepInputs([""]);
    };

    const handleAddStep = () => setStepInputs(prev => [...prev, ""]);
    const handleRemoveStep = (i) => setStepInputs(prev => prev.filter((_, idx) => idx !== i));
    const handleStepChange = (i, val) => {
        setStepInputs(prev => { const copy = [...prev]; copy[i] = val; return copy; });
    };

    const handleSavePlan = async (goalId) => {
        const validSteps = stepInputs.map(s => s.trim()).filter(Boolean);
        if (validSteps.length === 0) {
            alert("Add at least one step.");
            return;
        }

        try {
            await API.post("/actionPlans", {
                studentId: student._id,
                goalId,
                steps: validSteps.map(t => ({ title: t }))
            });

            // Re-fetch from server to get steps with taskIds correctly set
            await fetchActionPlan(goalId);
            setShowPlanForm(null);
            setStepInputs([""]);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to save action plan");
        }
    };

    // Checkbox: toggle step isDone → marks linked Task complete/incomplete
    const handleStepToggle = async (goalId, planId, stepId, currentDone) => {
        // Optimistic update: flip isDone immediately so UI feels instant
        setActionPlans(prev => {
            const plan = prev[goalId];
            if (!plan) return prev;
            const updatedSteps = plan.steps.map(s =>
                s._id === stepId ? { ...s, isDone: !currentDone } : s
            );
            return { ...prev, [goalId]: { ...plan, steps: updatedSteps } };
        });

        try {
            const res = await API.patch(`/actionPlans/${planId}/step/${stepId}`, {
                isDone: !currentDone
            });
            // Confirm with server response (truth source)
            setActionPlans(prev => ({ ...prev, [goalId]: res.data.actionPlan }));
        } catch (err) {
            // Revert optimistic update on failure
            setActionPlans(prev => {
                const plan = prev[goalId];
                if (!plan) return prev;
                const revertedSteps = plan.steps.map(s =>
                    s._id === stepId ? { ...s, isDone: currentDone } : s
                );
                return { ...prev, [goalId]: { ...plan, steps: revertedSteps } };
            });
            alert(err.response?.data?.error || "Failed to update step");
        }
    };

    const handleDeletePlan = async (goalId, planId) => {
        if (!window.confirm("Delete this action plan?")) return;
        try {
            await API.delete(`/actionPlans/${planId}`);
            setActionPlans(prev => { const copy = { ...prev }; delete copy[goalId]; return copy; });
        } catch (err) {
            alert(err.response?.data?.error || "Failed to delete action plan");
        }
    };

    if (loading) return <h3 className="loading-text">Loading goals...</h3>;

    return (
        <div className="goals-page">
            <h2>My Goals</h2>

            <form className="goal-form" onSubmit={handleAddGoal}>
                <input
                    placeholder="Goal Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <GoalTypePicker value={type} onChange={setType} />
                <input
                    type="date"
                    placeholder="Deadline (Optional)"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="deadline-input"
                />
                <button type="submit">Add Goal</button>
            </form>

            {goals.length === 0 ? (
                <p className="empty-message">No goals found. Add your first goal above.</p>
            ) : (
                <ul className="goal-list">
                    {goals.map((goal) => {
                        const formattedDeadline = goal.endDate ? new Date(goal.endDate).toLocaleDateString() : null;
                        const plan = actionPlans[goal._id];

                        if (editingGoalId === goal._id) {
                            return (
                                <li key={goal._id} className="goal-item editing-goal">
                                    <div className="goal-edit-form">
                                        <input
                                            type="text"
                                            value={editFormData.title}
                                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                            className="edit-input"
                                            placeholder="Goal Title"
                                        />
                                        <GoalTypePicker
                                            value={editFormData.type}
                                            onChange={(nextType) => setEditFormData({ ...editFormData, type: nextType })}
                                            className="edit-goal-type-picker"
                                        />
                                        <input
                                            type="text"
                                            value={editFormData.status}
                                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                            className="edit-input"
                                            placeholder="Status (e.g. ongoing, completed)"
                                        />
                                        <input
                                            type="date"
                                            value={editFormData.endDate}
                                            onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                                            className="edit-input deadline-input"
                                        />
                                    </div>
                                    <div className="goal-actions">
                                        <button className="save-btn" onClick={() => handleUpdateGoal(goal._id)}>Save</button>
                                        <button className="cancel-btn" onClick={() => setEditingGoalId(null)}>Cancel</button>
                                    </div>
                                </li>
                            );
                        }

                        return (
                            <li key={goal._id} className="goal-item goal-card">
                                {/* Goal header row */}
                                <div className="goal-header-row">
                                    <div className="goal-info">
                                        <strong>{goal.title}</strong>
                                        <span> | Type: {goal.type}</span>
                                        <span> | Status: {goal.status}</span>
                                        {formattedDeadline && <span className="goal-deadline"> | Deadline: {formattedDeadline}</span>}
                                    </div>
                                    <div className="goal-actions">
                                        <button className="edit-btn" onClick={() => handleEditClick(goal)}>Edit</button>
                                        <button className="delete-btn" onClick={() => handleDeleteGoal(goal._id)}>Delete</button>
                                        {!plan && (
                                            <button className="plan-btn" onClick={() => handleOpenPlanForm(goal._id)}>
                                                + Action Plan
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Action Plan Form */}
                                {showPlanForm === goal._id && (
                                    <div className="ap-form">
                                        <p className="ap-form-title">📋 Create Action Plan</p>
                                        {stepInputs.map((val, i) => (
                                            <div key={i} className="ap-step-row">
                                                <input
                                                    className="ap-step-input"
                                                    placeholder={`Step ${i + 1}`}
                                                    value={val}
                                                    onChange={(e) => handleStepChange(i, e.target.value)}
                                                />
                                                {stepInputs.length > 1 && (
                                                    <button className="ap-remove-step" onClick={() => handleRemoveStep(i)}>✕</button>
                                                )}
                                            </div>
                                        ))}
                                        <div className="ap-form-actions">
                                            <button className="ap-add-step-btn" onClick={handleAddStep}>+ Add Step</button>
                                            <button className="save-btn" onClick={() => handleSavePlan(goal._id)}>Save Plan</button>
                                            <button className="cancel-btn" onClick={() => setShowPlanForm(null)}>Cancel</button>
                                        </div>
                                    </div>
                                )}

                                {/* Display existing ActionPlan */}
                                {plan && (
                                    <div className="ap-display">
                                        <div className="ap-display-header">
                                            <span className="ap-label">📋 Action Plan</span>
                                            <button className="delete-btn ap-delete-btn" onClick={() => handleDeletePlan(goal._id, plan._id)}>
                                                Delete Plan
                                            </button>
                                        </div>
                                        <ul className="ap-steps-list">
                                            {plan.steps.map((step) => (
                                                <li key={step._id} className={`ap-step-item ${step.isDone ? "ap-step-done" : ""}`}>
                                                    <label className="ap-step-label">
                                                        <input
                                                            type="checkbox"
                                                            checked={step.isDone}
                                                            onChange={() => handleStepToggle(goal._id, plan._id, step._id, step.isDone)}
                                                            className="ap-checkbox"
                                                        />
                                                        <span className="ap-step-title">{step.title}</span>
                                                        {step.isDone && <span className="ap-task-badge">✅ Completed</span>}
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default Goals;
