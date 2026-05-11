import { useEffect, useState } from "react";
import API from "../services/api";
import "./Subjects.css";

function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [subjectName, setSubjectName] = useState("");
    const [loading, setLoading] = useState(true);

    const student = JSON.parse(localStorage.getItem("student"));

    useEffect(() => {
        if (!student) return;

        API.get(`/subjects/${student._id}`)
            .then(res => {
                setSubjects(res.data.subjects);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            });
    }, []);

    const handleAddSubject = async (e) => {
        e.preventDefault();

        const trimmedName = subjectName.trim();
        if (!trimmedName) {
            alert("Subject name is required.");
            return;
        }
        if (/^\d+$/.test(trimmedName)) {
            alert("Subject name cannot be only numbers. Please enter a meaningful subject name.");
            return;
        }
        if (trimmedName.length < 2) {
            alert("Subject name must be at least 2 characters.");
            return;
        }

        try {
            const res = await API.post("/subjects", {
                studentId: student._id,
                subjectName
            });

            setSubjects([...subjects, res.data.subject]);
            setSubjectName("");
            alert("Subject added successfully");
        } catch (err) {
            alert(err.response?.data?.error || "Failed to add subject");
        }
    };

    const handleDeleteSubject = async (id) => {
        if (!window.confirm("Are you sure you want to delete this subject?")) return;

        try {
            await API.delete(`/subjects/${id}`);
            setSubjects(subjects.filter(s => s._id !== id));
        } catch (err) {
            alert(err.response?.data?.error || "Failed to delete subject");
        }
    };

    if (loading) return <h3 className="loading-text">Loading subjects...</h3>;

    return (
        <div className="subjects-page">
            <h2>My Subjects</h2>

            {/* Existing Add Subject Form */}
            <form className="subject-form" onSubmit={handleAddSubject}>
                <input
                    placeholder="Subject Name"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                />
                <button type="submit">Add New Subject</button>
            </form>

            {subjects.length === 0 ? (
                <p className="empty-message">No subjects found. Add your first subject above.</p>
            ) : (
                <ul className="subject-list">
                    {subjects.map((subject) => (
                        <li key={subject._id} className="subject-item">
                            <div className="subject-info">
                                <strong>{subject.subjectName}</strong>
                                <span> | Status: {subject.status}</span>
                            </div>
                            <button
                                className="delete-subject-btn"
                                onClick={() => handleDeleteSubject(subject._id)}
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <hr className="divider" />

            {/* Timetable Management Section */}
            <TimetableManager subjects={subjects} studentId={student._id} onSubjectAdded={setSubjects} />
        </div>
    );
}

// Sub-component for Timetable Management
function TimetableManager({ subjects, studentId, onSubjectAdded }) {
    const [selectedDay, setSelectedDay] = useState("Monday"); // Default to Monday
    const [timetable, setTimetable] = useState(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [newSubjectName, setNewSubjectName] = useState("");
    const [loadingTimetable, setLoadingTimetable] = useState(true);
    const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);

    const selectedSubject = subjects.find(sub => sub._id === selectedSubjectId);

    // Fetch timetable when day changes
    useEffect(() => {
        if (!selectedDay) return;
        API.get(`/timetable/${studentId}/${selectedDay}`)
            .then(res => {
                setTimetable(res.data.timetable);
                setLoadingTimetable(false);
            })
            .catch(err => {
                // If 404, it just means no timetable for this day yet
                if (err.response && err.response.status === 404) {
                    setTimetable(null);
                } else {
                    console.error("Error fetching timetable:", err);
                }
                setLoadingTimetable(false);
            });
    }, [selectedDay, studentId]);

    const handleAddToTimetable = async (e) => {
        e.preventDefault();

        if (!selectedSubjectId && !newSubjectName.trim()) {
            alert("Please select an existing subject or enter a new subject name.");
            return;
        }

        // Validate new subject name if provided
        if (!selectedSubjectId && newSubjectName.trim()) {
            const trimmedNew = newSubjectName.trim();
            if (/^\d+$/.test(trimmedNew)) {
                alert("Subject name cannot be only numbers. Please enter a meaningful subject name.");
                return;
            }
            if (trimmedNew.length < 2) {
                alert("Subject name must be at least 2 characters.");
                return;
            }
        }

        try {
            let finalSubjectId = selectedSubjectId;

            // If creating a new subject first
            if (!selectedSubjectId && newSubjectName.trim()) {
                const res = await API.post("/subjects", {
                    studentId,
                    subjectName: newSubjectName.trim(),
                    day: selectedDay // Optional: set default day on subject too
                });
                finalSubjectId = res.data.subject._id;

                // Update parent state with new subject
                onSubjectAdded(prev => [...prev, res.data.subject]);
                setNewSubjectName("");
            }

            // Now add to timetable
            const timetableRes = await API.post("/timetable/add-subject", {
                studentId,
                day: selectedDay,
                subjectId: finalSubjectId
            });

            setTimetable(timetableRes.data.timetable);
            setSelectedSubjectId("");
            setSubjectDropdownOpen(false);
            alert("Subject added to timetable!");

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to update timetable");
        }
    };

    return (
        <div className="timetable-section">
            <h2>Manage Timetable</h2>

            <div className="timetable-controls">
                <select
                    value={selectedDay}
                    onChange={(e) => {
                        setLoadingTimetable(true);
                        setSelectedDay(e.target.value);
                    }}
                    className="day-selector"
                >
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            <div className="timetable-view">
                <h3>{selectedDay}'s Schedule</h3>
                {loadingTimetable ? (
                    <p>Loading...</p>
                ) : (
                    <div className="timetable-list">
                        {timetable && timetable.subjects && timetable.subjects.length > 0 ? (
                            <ul>
                                {timetable.subjects.map((sub, index) => (
                                    sub && (
                                        <li key={index} className="timetable-item">
                                            {sub.subjectName}
                                        </li>
                                    )
                                ))}
                            </ul>
                        ) : (
                            <p className="no-schedule">No subjects scheduled for {selectedDay}.</p>
                        )}
                    </div>
                )}
            </div>

            <form className="add-timetable-form" onSubmit={handleAddToTimetable}>
                <h4>Add to {selectedDay}</h4>

                <div className="form-group">
                    <label>Choose Existing:</label>
                    <div className="subject-picker">
                        <button
                            type="button"
                            className="subject-picker-toggle"
                            onClick={() => setSubjectDropdownOpen(open => !open)}
                            aria-haspopup="listbox"
                            aria-expanded={subjectDropdownOpen}
                        >
                            <span>{selectedSubject ? selectedSubject.subjectName : "-- Select Subject --"}</span>
                            <span className="subject-picker-arrow">⌄</span>
                        </button>

                        {subjectDropdownOpen && (
                            <div className="subject-picker-options" role="listbox">
                                <button
                                    type="button"
                                    className={`subject-picker-option ${!selectedSubjectId ? "selected" : ""}`}
                                    onClick={() => {
                                        setSelectedSubjectId("");
                                        setSubjectDropdownOpen(false);
                                    }}
                                >
                                    -- Select Subject --
                                </button>

                                {subjects.map(sub => (
                                    <button
                                        key={sub._id}
                                        type="button"
                                        className={`subject-picker-option ${selectedSubjectId === sub._id ? "selected" : ""}`}
                                        onClick={() => {
                                            setSelectedSubjectId(sub._id);
                                            setNewSubjectName("");
                                            setSubjectDropdownOpen(false);
                                        }}
                                    >
                                        {sub.subjectName}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-divider">OR</div>

                <div className="form-group">
                    <label>Create New:</label>
                    <input
                        type="text"
                        placeholder="New Subject Name"
                        value={newSubjectName}
                        onChange={(e) => {
                            setNewSubjectName(e.target.value);
                            if (e.target.value) setSelectedSubjectId(""); // Clear existing selection if typing new
                            if (e.target.value) setSubjectDropdownOpen(false);
                        }}
                    />
                </div>

                <button type="submit" className="add-btn">Add to Timetable</button>
            </form>
        </div>
    );
}

export default Subjects;
