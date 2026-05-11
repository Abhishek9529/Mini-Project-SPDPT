import "./SubjectProgressCards.css";

function SubjectProgressCards({ subjects }) {
    if (!subjects || subjects.length === 0) {
        return (
            <section className="subject-progress-section">
                <div className="subject-progress-header">
                    <h3>Subject Progress</h3>
                </div>
                <p className="subject-progress-empty">No classes scheduled for today.</p>
            </section>
        );
    }

    return (
        <section className="subject-progress-section">
            <div className="subject-progress-header">
                <h3>Subject Progress</h3>
                <span>{subjects.length} subjects</span>
            </div>

            <div className="subject-progress-list">
                {subjects.map(subject => (
                    <article className="subject-progress-item" key={subject.id}>
                        <div className="subject-progress-topline">
                            <div className="subject-progress-name-block">
                                <h4>{subject.name}</h4>
                                <p>{subject.completed} / {subject.total} sub-tasks done</p>
                            </div>
                            <span className={subject.pending === 0 && subject.total > 0 ? "subject-progress-badge done" : "subject-progress-badge"}>
                                {subject.pending} pending
                            </span>
                        </div>

                        <div className="subject-progress-bar-track">
                            <div
                                className="subject-progress-bar-fill"
                                style={{ width: `${subject.progress}%` }}
                            />
                        </div>

                        <div className="subject-progress-footer">
                            <span>{subject.total === 0 ? "No sub-tasks yet" : `${subject.progress}% complete`}</span>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default SubjectProgressCards;
