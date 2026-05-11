import "./SubjectSubTasks.css";

function UncompletedSubTasks({ tasks }) {
    return (
        <div className="subject-subtask-card subject-subtask-card-pending">
            <h3>Pending Subject Sub-tasks</h3>

            {tasks && tasks.length > 0 ? (
                <ul className="subject-subtask-list">
                    {tasks.map(task => (
                        <li key={task._id} className="subject-subtask-item">
                            <div className="subject-subtask-info">
                                <span className="subject-subtask-title">{task.taskTitle}</span>
                                {task.subjectName && (
                                    <span className="subject-subtask-meta">{task.subjectName}</span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="subject-subtask-empty">No pending subject sub-tasks.</p>
            )}
        </div>
    );
}

export default UncompletedSubTasks;
