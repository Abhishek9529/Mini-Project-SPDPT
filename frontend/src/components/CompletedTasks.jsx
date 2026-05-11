import React from 'react';
import './TaskLists.css';

function CompletedTasks({ tasks }) {
    if (!tasks || tasks.length === 0) return null;

    return (
        <div className="task-list-card completed-card">
            <h3><i className="ri-check-double-line" aria-hidden="true"></i> Completed History</h3>
            <ul className="history-task-list">
                {tasks.map(task => (
                    <li key={task._id} className="history-task-item completed-item">
                        <div className="task-info">
                            <span className="task-title">{task.taskTitle}</span>
                            <span className="task-date">
                                <i className="ri-calendar-line" aria-hidden="true"></i> {new Date(task.date).toLocaleDateString()}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default CompletedTasks;
