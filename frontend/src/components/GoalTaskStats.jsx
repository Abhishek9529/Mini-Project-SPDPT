import "./GoalTaskStats.css";

function GoalTaskStats({ goals, totalGoals }) {
    const visibleGoals = goals || [];

    return (
        <section className="goal-stats-section">
            <div className="goal-stats-header">
                <div>
                    <h3>Goal Task Status</h3>
                    <p>Tasks are grouped by goal.</p>
                </div>
                <div className="goal-stats-overview">
                    <span>{totalGoals} goals</span>
                </div>
            </div>

            {visibleGoals.length > 0 ? (
                <div className="goal-stats-grid">
                    {visibleGoals.map(({ goal, tasks }) => {
                        const completed = tasks.filter(task => task.isCompleted).length;
                        const pending = tasks.length - completed;

                        return (
                            <article className="goal-stats-card" key={goal._id}>
                                <div className="goal-stats-title-row">
                                    <h4>{goal.title}</h4>
                                    <span>{goal.type}</span>
                                </div>

                                <div className="goal-stats-counts">
                                    <div>
                                        <span className="goal-stats-number completed">{completed}</span>
                                        <span className="goal-stats-label">Completed</span>
                                    </div>
                                    <div>
                                        <span className="goal-stats-number pending">{pending}</span>
                                        <span className="goal-stats-label">Pending</span>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <p className="goal-stats-empty">No goal tasks yet.</p>
            )}
        </section>
    );
}

export default GoalTaskStats;
