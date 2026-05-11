import "./SubjectSubTasks.css";

function CompletedSubTasks({ tasks }) {
    return (
        <div className="subject-subtask-card subject-subtask-card-completed">
            <h3>Completed Subject Sub-tasks</h3>

            {tasks && tasks.length > 0 ? (
                <ul className="subject-subtask-list">
                    {tasks.map(task => (
                        <li key={task._id} className="subject-subtask-item subject-subtask-item-done">
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
                <p className="subject-subtask-empty">No completed subject sub-tasks yet.</p>
            )}
        </div>
    );
}

export default CompletedSubTasks;
