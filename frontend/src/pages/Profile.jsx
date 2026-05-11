import { useEffect, useState } from "react";
import API from "../services/api";
import "./Profile.css";

const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const isSubjectTask = (task) => {
    return !!task?.subjectId || task?.taskType === "lecture-subtask";
};

function Profile() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        branch: "",
    });

    const [performance, setPerformance] = useState({
        academicProgress: 0,
        skillProgress: 0,
        productivityScore: 0,
        taskStreak: 0,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const student = JSON.parse(localStorage.getItem("student"));
        if (!student) {
            setErrorMsg("Failed to load profile data.");
            setLoading(false);
            return;
        }

        const fetchStudent = API.get(`/students/${student._id}`);
        const fetchTasks = API.get(`/tasks/${student._id}`).catch(() => ({ data: { tasks: [] } }));
        const fetchMyDay = API.get(`/myday/${student._id}`).catch(() => ({ data: {} }));

        Promise.all([fetchStudent, fetchTasks, fetchMyDay])
            .then(([studentRes, tasksRes, myDayRes]) => {
                const s = studentRes.data.student;
                const tasks = tasksRes.data.tasks || [];
                const goalTasks = tasks.filter((task) => !isSubjectTask(task));
                const myDay = myDayRes.data || {};

                const academicTasks = goalTasks.filter((task) => task.goalId && task.goalId.type === "academic");
                const completedAcademic = academicTasks.filter((task) => task.isCompleted).length;
                const academicProgress = academicTasks.length > 0
                    ? Math.round((completedAcademic / academicTasks.length) * 100)
                    : 0;

                const skillTasks = goalTasks.filter((task) => task.goalId && task.goalId.type === "skill");
                const completedSkill = skillTasks.filter((task) => task.isCompleted).length;
                const skillProgress = skillTasks.length > 0
                    ? Math.round((completedSkill / skillTasks.length) * 100)
                    : 0;

                let productivityScore = 0;
                if (myDay.productivityScore !== undefined) {
                    productivityScore = myDay.productivityScore;
                } else if (myDay.categories) {
                    const productiveNames = [
                        "study",
                        "skills",
                        "college",
                        "coding",
                        "code",
                        "dsa",
                        "programming",
                        "project",
                        "homework",
                        "assignment",
                        "lecture",
                        "class",
                        "lab",
                        "reading",
                        "research",
                        "practice",
                        "learn",
                        "course",
                        "tutorial",
                        "exam",
                        "test",
                        "revision",
                        "competitive",
                        "development",
                        "dev",
                        "internship",
                        "work",
                        "training",
                        "workshop",
                        "seminar",
                    ];
                    const productive = myDay.categories
                        .filter((category) => productiveNames.some((name) => (category.name || "").toLowerCase().includes(name)))
                        .reduce((sum, category) => sum + (Number(category.hours) || 0), 0);
                    const total = myDay.totalHours || 0;
                    productivityScore = total > 0 ? Math.round((productive / total) * 100) : 0;
                }

                const completedDates = [...new Set(
                    tasks
                        .filter((task) => task.isCompleted && task.date)
                        .map((task) => task.date.split("T")[0])
                )].sort().reverse();

                let taskStreak = 0;
                const todayStr = getLocalDateString();
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = getLocalDateString(yesterday);

                if (completedDates.length > 0) {
                    let expectedDate = new Date();
                    if (completedDates[0] === todayStr) {
                        taskStreak = 1;
                    } else if (completedDates[0] === yesterdayStr) {
                        taskStreak = 1;
                        expectedDate = yesterday;
                    }

                    if (taskStreak > 0) {
                        for (let i = 1; i < completedDates.length; i++) {
                            expectedDate.setDate(expectedDate.getDate() - 1);
                            if (completedDates[i] === getLocalDateString(expectedDate)) {
                                taskStreak++;
                            } else {
                                break;
                            }
                        }
                    }
                }

                setForm({
                    name: s.name || "",
                    email: s.email || "",
                    branch: s.branch || "",
                });

                setPerformance({
                    academicProgress,
                    skillProgress,
                    productivityScore,
                    taskStreak,
                });

                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching profile data:", err);
                setErrorMsg("Failed to load profile data.");
                setLoading(false);
            });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const student = JSON.parse(localStorage.getItem("student"));
        if (!student) return;

        const trimmedName = (form.name || "").trim();
        if (!trimmedName) {
            setErrorMsg("Name is required.");
            return;
        }
        if (/^\d+$/.test(trimmedName)) {
            setErrorMsg("Name cannot be only numbers. Please enter your real name.");
            return;
        }
        if (trimmedName.length < 2) {
            setErrorMsg("Name must be at least 2 characters.");
            return;
        }

        setSaving(true);
        setSuccessMsg("");
        setErrorMsg("");

        try {
            const res = await API.put(`/students/${student._id}`, {
                name: trimmedName,
                branch: form.branch,
            });

            setSuccessMsg("Profile updated successfully!");
            localStorage.setItem("student", JSON.stringify(res.data.student));
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err) {
            console.error("Error saving profile:", err?.response?.data || err);
            const msg = err?.response?.data?.error || "Failed to save profile. Please try again.";
            setErrorMsg(msg);
            setTimeout(() => setErrorMsg(""), 4000);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <h3 className="profile-loading">Loading profile...</h3>;

    return (
        <div className="profile-page">
            <h2>My Profile</h2>

            {successMsg && <div className="profile-success">{successMsg}</div>}
            {errorMsg && <div className="profile-error">{errorMsg}</div>}

            <div className="profile-section">
                <h3>Basic Information</h3>
                <div className="profile-form-grid">
                    <div className="profile-field">
                        <label>Name</label>
                        <input name="name" value={form.name} onChange={handleChange} />
                    </div>
                    <div className="profile-field">
                        <label>Email</label>
                        <input name="email" value={form.email} readOnly />
                    </div>
                    <div className="profile-field">
                        <label>Branch</label>
                        <input name="branch" value={form.branch} onChange={handleChange} />
                    </div>
                </div>
            </div>

            <div className="profile-section">
                <h3>Performance Metrics</h3>
                <div className="perf-grid">
                    <div className="perf-card">
                        <p className="perf-value purple">{performance.academicProgress}%</p>
                        <p className="perf-label">Academic Progress</p>
                    </div>
                    <div className="perf-card">
                        <p className="perf-value green">{performance.skillProgress}%</p>
                        <p className="perf-label">Skill Progress</p>
                    </div>
                    <div className="perf-card">
                        <p className="perf-value blue">{performance.productivityScore}</p>
                        <p className="perf-label">Productivity Score</p>
                    </div>
                    <div className="perf-card">
                        <p className="perf-value orange">{performance.taskStreak}</p>
                        <p className="perf-label">Task Streak</p>
                    </div>
                </div>
            </div>

            <div className="profile-save-row">
                <button
                    className="profile-save-btn"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save Profile"}
                </button>
            </div>
        </div>
    );
}

export default Profile;
