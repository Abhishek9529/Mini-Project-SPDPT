import React from "react";

function GoalsProgress({ allGoals, selectedGoalType, setSelectedGoalType }) {

    const typeConfig = {
        academic: { icon: "ri-graduation-cap-line", fillClass: "academic-fill", colorClass: "academic-color" },
        skill: { icon: "ri-tools-line", fillClass: "skill-fill", colorClass: "skill-color" },
        shortterm: { icon: "ri-focus-3-line", fillClass: "shortterm-fill", colorClass: "shortterm-color" },
        midterm: { icon: "ri-line-chart-line", fillClass: "midterm-fill", colorClass: "midterm-color" },
        longterm: { icon: "ri-rocket-line", fillClass: "longterm-fill", colorClass: "longterm-color" },
        exam: { icon: "ri-file-edit-line", fillClass: "academic-fill", colorClass: "academic-color" },
    };

    return (
        <div className="progress-grid">
            {allGoals.filter(({ tasks }) => tasks.length > 0).length === 0 ? (
                <div className="progress-card" style={{ gridColumn: "span 2" }}>
                    <p style={{ color: "var(--text-muted)", textAlign: "center", margin: 0 }}>
                        No goal tasks yet. <a href="/goals" style={{ color: "var(--accent-primary)" }}>Add tasks to your goals →</a>
                    </p>
                </div>
            ) : (
                allGoals.filter(({ tasks }) => tasks.length > 0).map(({ goal, tasks, progress }) => {
                    const cfg = typeConfig[goal.type] || { icon: "ri-flag-line", fillClass: "shortterm-fill", colorClass: "shortterm-color" };
                    const isGoalOpen = selectedGoalType === goal._id;

                    return (
                        <div className="progress-card" key={goal._id}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                                <h3 style={{ margin: 0, fontSize: "0.95rem" }}>
                                    <i className={cfg.icon} aria-hidden="true"></i> {goal.title}
                                </h3>
                                <span style={{
                                    fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase",
                                    padding: "2px 8px", borderRadius: "999px", background: "rgba(129,140,248,0.15)",
                                    color: "var(--accent-primary)", letterSpacing: "0.05em"
                                }}>
                                    {goal.type}
                                </span>
                            </div>

                            <div className="progress-bar-track">
                                <div
                                    className={`progress-bar-fill ${cfg.fillClass}`}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.3rem" }}>
                                <p className={`progress-percent ${cfg.colorClass}`} style={{ margin: 0 }}>{progress}%</p>
                                {tasks.length > 0 && (
                                    <button
                                        className="view-tasks-btn"
                                        onClick={() => setSelectedGoalType(isGoalOpen ? null : goal._id)}
                                    >
                                        {isGoalOpen ? "Hide Tasks" : `View Tasks (${tasks.length})`}
                                    </button>
                                )}
                            </div>

                            {/* Expandable task list */}
                            {isGoalOpen && (
                                <div className="goal-tasks-list">
                                    <ul>
                                        {tasks.map(task => (
                                            <li key={task._id} className={task.isCompleted ? "completed-task" : "pending-task"}>
                                                <span className="task-status-icon">
                                                    <i className={task.isCompleted ? "ri-check-line" : "ri-circle-line"} aria-hidden="true"></i>
                                                </span>
                                                <span className="task-name">{task.taskTitle}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {goal.endDate && (
                                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0.4rem 0 0" }}>
                                    Deadline: {new Date(goal.endDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default GoalsProgress;