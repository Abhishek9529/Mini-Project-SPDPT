import UncompletedTasks from "./UncompletedTasks";
import CompletedTasks from "./CompletedTasks";

function TodaysLectures({
    currentDay,
    timetable,
    showHistory,
    setShowHistory,
    backlogTasks,
    completedHistory,
    getLectureTasks,
    activeSubtaskSubject,
    setActiveSubtaskSubject,
    expandedLectureSubjects,
    toggleLectureDropdown,
    newSubtaskTitles,
    handleNewSubtaskTitleChange,
    handleSubtaskKeyDown,
    addLectureSubtask,
    toggleLectureSubtask
}) {
    return (
        <div className="dashboard-timetable-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3>Today's Lectures ({currentDay})</h3>
                <button
                    className="view-tasks-btn"
                    onClick={() => setShowHistory(!showHistory)}
                >
                    {showHistory ? "Hide History" : "Show History"}
                </button>
            </div>

            {showHistory && (
                <div style={{ marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <UncompletedTasks tasks={backlogTasks} />
                    <CompletedTasks tasks={completedHistory} />
                </div>
            )}

            {timetable && timetable.subjects && timetable.subjects.length > 0 ? (
                <ul className="dashboard-timetable-list">
                    {timetable.subjects.map((sub, index) => {
                        if (!sub) return null;
                        const subjectTasks = getLectureTasks(sub._id);
                        const pendingSubjectTaskCount = subjectTasks.filter(task => !task.isCompleted).length;
                        const isDone = subjectTasks.length > 0 && subjectTasks.every(task => task.isCompleted);
                        const isAdding = activeSubtaskSubject === sub._id;
                        const isExpanded = !!expandedLectureSubjects[sub._id];

                        return (
                            <li key={sub._id || index} className={`dt-item ${isDone ? "dt-item-done" : ""}`}>
                                <div className="dt-subject-row">
                                    <div className="dt-subject-main">
                                        <span className={`dt-subject ${isDone ? "dt-subject-done" : ""}`}>
                                            {sub.subjectName}
                                        </span>
                                        <span className="dt-pending-count">
                                            {pendingSubjectTaskCount} pending
                                        </span>
                                    </div>

                                    <div className="lecture-row-actions">
                                        <button
                                            type="button"
                                            className="lecture-add-btn"
                                            onClick={() => setActiveSubtaskSubject(isAdding ? null : sub._id)}
                                            aria-label={`Add sub-task for ${sub.subjectName}`}
                                            title={`Add sub-task for ${sub.subjectName}`}
                                        >
                                            +
                                        </button>
                                        <button
                                            type="button"
                                            className={`lecture-dropdown-btn ${isExpanded ? "lecture-dropdown-btn-open" : ""}`}
                                            onClick={() => toggleLectureDropdown(sub._id)}
                                            aria-expanded={isExpanded}
                                            aria-label={`${isExpanded ? "Hide" : "Show"} sub-tasks for ${sub.subjectName}`}
                                            title={`${isExpanded ? "Hide" : "Show"} sub-tasks`}
                                        >
                                            v
                                        </button>
                                    </div>
                                </div>

                                {isAdding && (
                                    <div className="lecture-subtask-form">
                                        <input
                                            value={newSubtaskTitles[sub._id] || ""}
                                            onChange={(e) => handleNewSubtaskTitleChange(sub._id, e.target.value)}
                                            onKeyDown={(e) => handleSubtaskKeyDown(e, sub)}
                                            placeholder="New sub-task"
                                            autoFocus
                                        />
                                        <button type="button" onClick={() => addLectureSubtask(sub)}>
                                            Add
                                        </button>
                                    </div>
                                )}

                                {isExpanded && (
                                    subjectTasks.length > 0 ? (
                                        <ul className="lecture-subtask-list">
                                            {subjectTasks.map(task => (
                                                <li
                                                    key={task._id}
                                                    className={`lecture-subtask-item ${task.isCompleted ? "lecture-subtask-done" : ""}`}
                                                >
                                                    <label className="lecture-subtask-label">
                                                        <input
                                                            type="checkbox"
                                                            checked={task.isCompleted}
                                                            onChange={() => toggleLectureSubtask(task)}
                                                        />
                                                        <span>{task.taskTitle}</span>
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="lecture-empty-subtasks">No sub-tasks yet.</p>
                                    )
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="no-schedule-text">No classes scheduled for today.</p>
            )}
        </div>
    );
}

export default TodaysLectures;