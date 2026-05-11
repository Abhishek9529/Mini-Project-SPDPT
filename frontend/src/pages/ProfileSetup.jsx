import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function ProfileSetup() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        branch: "",
        semester: "",
        collegeName: "",
        enrollmentNumber: "",
        // Academic
        lastSemSGPA: 0,
        MSC1: 0,
        MSC2: 0,
        lastYearResult: "",
        attendance: 0,
        backlogs: 0,
        // Career
        careerGoal: "",
        technicalSkills: [],
        softSkills: [],
        certifications: "",
        projects: "",
        linkedin: "",
        github: "",
        // Personal
        achievements: "",
        hobbies: "",
    });

    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Temp inputs for tag-style skill entry
    const [techInput, setTechInput] = useState("");
    const [softInput, setSoftInput] = useState("");

    // ===== Pre-fill from localStorage student data =====
    useEffect(() => {
        const student = JSON.parse(localStorage.getItem("student"));
        if (!student) {
            navigate("/");
            return;
        }

        // Pre-fill whatever we already have from login response
        setForm((prev) => ({
            ...prev,
            name: student.name || "",
            email: student.email || "",
            branch: student.branch || "",
            semester: student.semester || "",
            collegeName: student.collegeName || "",
            enrollmentNumber: student.enrollmentNumber || "",
            lastSemSGPA: student.lastSemSGPA || 0,
            MSC1: student.MSC1 || 0,
            MSC2: student.MSC2 || 0,
            lastYearResult: student.lastYearResult || "",
            attendance: student.attendance || 0,
            backlogs: student.backlogs || 0,
            careerGoal: student.careerGoal || "",
            technicalSkills: student.technicalSkills || [],
            softSkills: student.softSkills || [],
            certifications: student.certifications || "",
            projects: student.projects || "",
            linkedin: student.linkedin || "",
            github: student.github || "",
            achievements: student.achievements || "",
            hobbies: student.hobbies || "",
        }));
    }, [navigate]);

    // ===== Generic input handler =====
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // ===== Skill tag helpers =====
    const addSkill = (field, inputValue, setInputValue) => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        if (form[field].includes(trimmed)) return;
        setForm((prev) => ({ ...prev, [field]: [...prev[field], trimmed] }));
        setInputValue("");
    };

    const removeSkill = (field, index) => {
        setForm((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    };

    // ===== Save & go to dashboard =====
    const handleSaveAndContinue = async () => {
        const student = JSON.parse(localStorage.getItem("student"));
        if (!student) return;

        setSaving(true);
        setErrorMsg("");

        try {
            // Exclude email from update payload
            const updateData = { ...form };
            delete updateData.email;
            const res = await API.put(`/students/${student._id}`, updateData);

            // Update localStorage with latest student data
            const updated = res.data.student;
            localStorage.setItem("student", JSON.stringify(updated));

            // Go to dashboard
            navigate("/dashboard");
        } catch (err) {
            console.error("Error saving profile:", err?.response?.data || err);
            const msg =
                err?.response?.data?.error || "Failed to save. Please try again.";
            setErrorMsg(msg);
            setTimeout(() => setErrorMsg(""), 4000);
        } finally {
            setSaving(false);
        }
    };

    // ===== Skip for now =====
    const handleSkip = () => {
        navigate("/dashboard");
    };

    return (
        <div className="profile-page">
            <h2>Complete Your Profile</h2>
            <p className="setup-subtitle">
                Welcome <strong>{form.name}</strong>! Fill in your details to get
                started.
            </p>

            {errorMsg && <div className="profile-error">{errorMsg}</div>}

            {/* ========== 1. Basic Info ========== */}
            <div className="profile-section">
                <h3>👤 Basic Information</h3>
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
                    <div className="profile-field">
                        <label>Semester</label>
                        <input
                            name="semester"
                            value={form.semester}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="profile-field">
                        <label>College Name</label>
                        <input
                            name="collegeName"
                            value={form.collegeName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="profile-field">
                        <label>Enrollment Number</label>
                        <input
                            name="enrollmentNumber"
                            value={form.enrollmentNumber}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            {/* ========== 2. Academic Info ========== */}
            <div className="profile-section">
                <h3>📚 Academic Information</h3>
                <div className="profile-form-grid">
                    <div className="profile-field">
                        <label>Last Sem SGPA</label>
                        <input
                            name="lastSemSGPA"
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            value={form.lastSemSGPA}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="profile-field">
                        <label>MSC 1</label>
                        <input
                            name="MSC1"
                            type="number"
                            step="0.01"
                            value={form.MSC1}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="profile-field">
                        <label>MSC 2</label>
                        <input
                            name="MSC2"
                            type="number"
                            step="0.01"
                            value={form.MSC2}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="profile-field">
                        <label>Last Year Result</label>
                        <input
                            name="lastYearResult"
                            value={form.lastYearResult}
                            onChange={handleChange}
                            placeholder="e.g. Pass / Fail / First Class"
                        />
                    </div>
                    <div className="profile-field">
                        <label>Attendance (%)</label>
                        <input
                            name="attendance"
                            type="number"
                            min="0"
                            max="100"
                            value={form.attendance}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="profile-field">
                        <label>Backlogs</label>
                        <input
                            name="backlogs"
                            type="number"
                            min="0"
                            value={form.backlogs}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            {/* ========== 3. Skills & Career ========== */}
            <div className="profile-section">
                <h3>🚀 Skills & Career</h3>
                <div className="profile-form-grid">
                    <div className="profile-field" style={{ gridColumn: "1 / -1" }}>
                        <label>Career Goal</label>
                        <input
                            name="careerGoal"
                            value={form.careerGoal}
                            onChange={handleChange}
                            placeholder="e.g. Full-Stack Developer, Data Scientist"
                        />
                    </div>
                </div>

                {/* Technical Skills (tags) */}
                <div className="profile-field" style={{ marginTop: "1rem" }}>
                    <label>Technical Skills</label>
                    <div className="skills-input-row">
                        <input
                            value={techInput}
                            onChange={(e) => setTechInput(e.target.value)}
                            placeholder="Type a skill & press Add"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addSkill("technicalSkills", techInput, setTechInput);
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={() =>
                                addSkill("technicalSkills", techInput, setTechInput)
                            }
                        >
                            Add
                        </button>
                    </div>
                    <div className="skills-tags">
                        {form.technicalSkills.map((skill, i) => (
                            <span key={i} className="skill-tag">
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => removeSkill("technicalSkills", i)}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Soft Skills (tags) */}
                <div className="profile-field" style={{ marginTop: "1rem" }}>
                    <label>Soft Skills</label>
                    <div className="skills-input-row">
                        <input
                            value={softInput}
                            onChange={(e) => setSoftInput(e.target.value)}
                            placeholder="Type a skill & press Add"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addSkill("softSkills", softInput, setSoftInput);
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => addSkill("softSkills", softInput, setSoftInput)}
                        >
                            Add
                        </button>
                    </div>
                    <div className="skills-tags">
                        {form.softSkills.map((skill, i) => (
                            <span key={i} className="skill-tag">
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => removeSkill("softSkills", i)}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="profile-form-grid" style={{ marginTop: "1rem" }}>
                    <div className="profile-field">
                        <label>Certifications</label>
                        <textarea
                            name="certifications"
                            value={form.certifications}
                            onChange={handleChange}
                            placeholder="List your certifications..."
                        />
                    </div>
                    <div className="profile-field">
                        <label>Projects</label>
                        <textarea
                            name="projects"
                            value={form.projects}
                            onChange={handleChange}
                            placeholder="Describe your projects..."
                        />
                    </div>
                    <div className="profile-field">
                        <label>LinkedIn URL</label>
                        <input
                            name="linkedin"
                            value={form.linkedin}
                            onChange={handleChange}
                            placeholder="https://linkedin.com/in/..."
                        />
                    </div>
                    <div className="profile-field">
                        <label>GitHub URL</label>
                        <input
                            name="github"
                            value={form.github}
                            onChange={handleChange}
                            placeholder="https://github.com/..."
                        />
                    </div>
                </div>
            </div>

            {/* ========== 4. Achievements & Hobbies ========== */}
            <div className="profile-section">
                <h3>🏆 Achievements & Hobbies</h3>
                <div className="profile-form-grid">
                    <div className="profile-field">
                        <label>Achievements</label>
                        <textarea
                            name="achievements"
                            value={form.achievements}
                            onChange={handleChange}
                            placeholder="Your accomplishments..."
                        />
                    </div>
                    <div className="profile-field">
                        <label>Hobbies</label>
                        <textarea
                            name="hobbies"
                            value={form.hobbies}
                            onChange={handleChange}
                            placeholder="What do you enjoy doing..."
                        />
                    </div>
                </div>
            </div>

            {/* ========== Action Buttons ========== */}
            <div className="profile-setup-actions">
                <button className="profile-skip-btn" onClick={handleSkip}>
                    Skip for Now
                </button>
                <button
                    className="profile-save-btn"
                    onClick={handleSaveAndContinue}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save & Continue →"}
                </button>
            </div>
        </div>
    );
}

export default ProfileSetup;
