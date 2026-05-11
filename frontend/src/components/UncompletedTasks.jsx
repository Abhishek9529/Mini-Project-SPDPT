import React from 'react';
import './TaskLists.css'; // We'll create a shared CSS file

function UncompletedTasks({ tasks }) {
    if (!tasks || tasks.length === 0) return null;

    return (
        <div className="task-list-card uncompleted-card">
            <h3><i className="ri-alert-line" aria-hidden="true"></i> Pending Backlog</h3>
            <ul className="history-task-list">
                {tasks.map(task => (
                    <li key={task._id} className="history-task-item uncompleted-item">
                        <div className="task-info">
                            <span className="task-title">{task.taskTitle}</span>
                            <span className="task-date">
                                <i className="ri-calendar-line" aria-hidden="true"></i> {new Date(task.date).toLocaleDateString()}
                            </span>
                        </div>
                        {task.goalId && (
                            <span className="task-goal-badge">{task.goalId.title}</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UncompletedTasks;
