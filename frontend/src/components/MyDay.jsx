import { useEffect, useState } from "react";
import API from "../services/api";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useTheme } from "../context/ThemeContext";
import "./MyDay.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
    "#6366f1", "#3b82f6", "#06b6d4", "#22c55e",
    "#ec4899", "#ef4444", "#f59e0b", "#a78bfa",
    "#14b8a6", "#f97316"
];

const IDEAL_DAY = [
    { name: "Sleep", hours: 7 },
    { name: "College", hours: 6 },
    { name: "Study", hours: 2 },
    { name: "Skills", hours: 2 },
    { name: "Family", hours: 2 },
    { name: "Health", hours: 2 },
    { name: "Misc", hours: 3 }
];

const PRODUCTIVE_NAMES = [
    "study", "skills", "college", "coding", "code", "dsa", "programming",
    "project", "homework", "assignment", "lecture", "class", "lab",
    "reading", "research", "practice", "learn", "course", "tutorial",
    "exam", "test", "revision", "competitive", "development", "dev",
    "internship", "work", "training", "workshop", "seminar"
];

function getRecommendations(categories) {
    const tips = [];
    const getHours = (keyword) => {
        return categories
            .filter(c => (c.name || "").toLowerCase().includes(keyword))
            .reduce((s, c) => s + (Number(c.hours) || 0), 0);
    };

    if (getHours("skills") < 2) tips.push("Try to spend more time on skills tomorrow.");
    if (getHours("study") < 3) tips.push("Increase study hours for better academic progress.");
    if (getHours("health") < 1 && getHours("gym") < 1 && getHours("exercise") < 1) tips.push("Take care of your health - add exercise or gym time.");
    if (getHours("sleep") < 6) tips.push("Proper sleep improves productivity. Aim for 7+ hours.");

    return tips;
}

const isPurelyNumeric = (str) => /^\d+$/.test(str.trim());

function validateRow(row) {
    const name = (row.name || "").trim();
    const hours = row.hours;

    if (!name) return "";
    if (isPurelyNumeric(name)) return "Activity name cannot be only numbers";
    if (name.length < 2) return "Activity name must be at least 2 characters";
    if (hours === "" || hours === null || hours === undefined) return "Hours are required";
    const h = Number(hours);
    if (isNaN(h)) return "Hours must be a number";
    if (h <= 0) return "Hours must be greater than 0";
    if (h > 24) return "Hours cannot exceed 24";
    return "";
}

function MyDay({ onSave }) {
    const { isDark } = useTheme();
    const styles = getComputedStyle(document.documentElement);
    const mutedText = styles.getPropertyValue("--text-muted").trim() || (isDark ? "#94a3b8" : "#64748b");
    const chartBorder = styles.getPropertyValue("--surface").trim() || (isDark ? "#111827" : "#ffffff");

    const [rows, setRows] = useState([{ name: "", hours: "", note: "" }]);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [rowErrors, setRowErrors] = useState([]);
    const [productivityScore, setProductivityScore] = useState(null);
    const [recommendations, setRecommendations] = useState([]);

    const totalHours = Number(rows.reduce((sum, r) => sum + (Number(r.hours) || 0), 0).toFixed(2));
    const remainingHours = Number((24 - totalHours).toFixed(2));

    const formatHoursToTime = (decimalHours) => {
        if (typeof decimalHours !== "number" || isNaN(decimalHours)) return "0h 0m";
        const h = Math.floor(decimalHours);
        const m = Math.round((decimalHours - h) * 60);

        if (m === 0) return `${h}h`;
        if (h === 0) return `${m}m`;
        return `${h}h ${m}m`;
    };

    const calcScore = (cats, total) => {
        if (!total || total === 0) return 0;
        const productive = cats
            .filter(c => PRODUCTIVE_NAMES.some(p => (c.name || "").toLowerCase().includes(p)))
            .reduce((s, c) => s + (Number(c.hours) || 0), 0);
        return Math.round((productive / total) * 100);
    };

    useEffect(() => {
        const student = JSON.parse(localStorage.getItem("student"));
        if (!student) return;

        API.get(`/myday/${student._id}`)
            .then(res => {
                console.log("MyDay API response:", res.data);
                if (res.data && res.data.categories && res.data.categories.length > 0) {
                    const cats = res.data.categories.map(c => ({
                        name: c.name || "",
                        hours: c.hours || "",
                        note: c.note || ""
                    }));
                    setRows(cats);
                    setRowErrors(cats.map(() => ""));
                    setSaved(true);

                    const score = res.data.productivityScore ?? calcScore(cats, res.data.totalHours);
                    setProductivityScore(score);
                    setRecommendations(getRecommendations(cats));
                }
            })
            .catch(err => console.log("MyDay fetch:", err));
    }, []);

    const updateRow = (index, field, value) => {
        if (field === "hours") {
            const num = Number(value);
            const othersTotal = rows.reduce(
                (sum, r, i) => i === index ? sum : sum + (Number(r.hours) || 0), 0
            );
            if (num < 0) return;
            if (Number((othersTotal + num).toFixed(2)) > 24) {
                setError("Total cannot exceed 24 hours!");
                return;
            }
            setError("");
        }

        setRows(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };

            const newErrors = [...rowErrors];
            newErrors[index] = field === "name" ? "" : validateRow(copy[index]);
            setRowErrors(newErrors);

            return copy;
        });

        if (field !== "hours") setError("");
    };

    const addRow = () => {
        if (totalHours >= 24) {
            setError("Already at 24 hours - no more categories!");
            return;
        }
        setRows(prev => [...prev, { name: "", hours: "", note: "" }]);
        setRowErrors(prev => [...prev, ""]);
    };

    const removeRow = (index) => {
        if (rows.length <= 1) return;
        setRows(prev => prev.filter((_, i) => i !== index));
        setRowErrors(prev => prev.filter((_, i) => i !== index));
        setError("");
    };

    const handleSubmit = async () => {
        const errors = rows.map(r => validateRow(r));
        setRowErrors(errors);

        const namedRows = rows.filter(r => (r.name || "").trim());
        if (namedRows.length === 0) {
            setError("Add at least one activity with a name and hours.");
            return;
        }

        const hasErrors = namedRows.some(r => validateRow(r) !== "");
        if (hasErrors) {
            setError("Please fix the highlighted errors before saving.");
            return;
        }

        const validRows = rows.filter(r => r.name.trim() && Number(r.hours) > 0);
        if (validRows.length === 0) {
            setError("Add at least one category with name and hours.");
            return;
        }

        const total = validRows.reduce((s, r) => s + Number(r.hours), 0);
        if (total > 24) {
            setError("Total hours cannot exceed 24!");
            return;
        }

        const student = JSON.parse(localStorage.getItem("student"));
        if (!student) return;

        setSaving(true);
        setError("");

        try {
            const cats = validRows.map(r => ({
                name: r.name.trim(),
                hours: Number(r.hours),
                note: r.note || ""
            }));

            const res = await API.post("/myday", {
                studentId: student._id,
                categories: cats
            });
            console.log("MyDay saved:", res.data);
            setSaved(true);

            const score = res.data.productivityScore ?? calcScore(cats, total);
            setProductivityScore(score);
            setRecommendations(getRecommendations(cats));

            if (onSave) onSave();
        } catch (err) {
            console.error("MyDay save error:", err);
            setError(err.response?.data?.error || "Failed to save. Try again.");
        } finally {
            setSaving(false);
        }
    };

    const idealPieData = {
        labels: IDEAL_DAY.map(d => `${d.name} (${formatHoursToTime(d.hours)})`),
        datasets: [{
            data: IDEAL_DAY.map(d => d.hours),
            backgroundColor: COLORS.slice(0, IDEAL_DAY.length),
            borderColor: chartBorder,
            borderWidth: 2
        }]
    };

    const filledRows = rows.filter(r => r.name.trim() && Number(r.hours) > 0);
    const actualPieData = {
        labels: filledRows.map(r => `${r.name} (${formatHoursToTime(Number(r.hours))})`),
        datasets: [{
            data: filledRows.map(r => Number(r.hours)),
            backgroundColor: filledRows.map((_, i) => COLORS[i % COLORS.length]),
            borderColor: chartBorder,
            borderWidth: 2
        }]
    };

    const makePieOptions = (withNotes = false) => ({
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: "bottom",
                labels: { color: mutedText, font: { size: 12 }, padding: 10 }
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const hours = ctx.parsed;
                        const pct = Math.round((hours / 24) * 100);
                        const formattedTime = formatHoursToTime(hours);
                        if (withNotes) {
                            const row = filledRows[ctx.dataIndex];
                            const note = row?.note ? ` - Note: ${row.note}` : "";
                            return ` ${row?.name} - ${formattedTime} (${pct}%)${note}`;
                        }
                        return ` ${ctx.label}: ${pct}%`;
                    }
                }
            }
        }
    });

    const scoreColor = productivityScore >= 60 ? "#22c55e"
        : productivityScore >= 40 ? "#f59e0b" : "#ef4444";

    return (
        <div className="myday-section">
            <h3><i className="ri-pie-chart-2-line" aria-hidden="true"></i> My Day Tracker</h3>

            {productivityScore !== null && (
                <div className="myday-score-card">
                    <div className="myday-score-header">
                        <span className="myday-score-icon"><i className="ri-fire-line" aria-hidden="true"></i></span>
                        <span className="myday-score-label">Productivity Score</span>
                        <span className="myday-score-value" style={{ color: scoreColor }}>
                            {productivityScore}%
                        </span>
                    </div>
                    <div className="myday-score-bar-track">
                        <div
                            className="myday-score-bar-fill"
                            style={{ width: `${productivityScore}%`, backgroundColor: scoreColor }}
                        ></div>
                    </div>
                    <p className="myday-score-hint">
                        Based on Study + Skills + College hours
                    </p>
                </div>
            )}

            <div className="myday-charts-grid">
                <div className="myday-chart-card">
                    <h4><i className="ri-focus-3-line" aria-hidden="true"></i> Ideal Day</h4>
                    <div className="myday-chart-wrapper">
                        <Pie data={idealPieData} options={makePieOptions(false)} />
                    </div>
                </div>

                <div className="myday-chart-card">
                    <h4><i className="ri-clipboard-line" aria-hidden="true"></i> My Actual Day</h4>
                    {saved && filledRows.length > 0 ? (
                        <div className="myday-chart-wrapper">
                            <Pie data={actualPieData} options={makePieOptions(true)} />
                        </div>
                    ) : (
                        <p className="myday-placeholder-text">
                            Fill in your activities below to see your actual day chart.
                        </p>
                    )}
                </div>
            </div>

            <div className="myday-form-card">
                <h4><i className="ri-time-line" aria-hidden="true"></i> Log Today's Hours</h4>

                <div className="myday-form-header">
                    <span>Activity</span>
                    <span>Hours</span>
                    <span>Note</span>
                    <span></span>
                </div>

                <div className="myday-form-grid">
                    {rows.map((row, i) => (
                        <div key={i} className="myday-form-row-wrapper">
                            <div className={`myday-form-row ${rowErrors[i] ? "myday-row-error" : ""}`}>
                                <input
                                    type="text"
                                    placeholder="e.g. Sleep, Study, Gym..."
                                    value={row.name}
                                    onChange={(e) => updateRow(i, "name", e.target.value)}
                                    className={`myday-name-input ${rowErrors[i] ? "input-error" : ""}`}
                                    title="Enter the activity name (e.g. Sleep, Study)"
                                />
                                <input
                                    type="number"
                                    min="0.5"
                                    max={Number(row.hours || 0) + remainingHours}
                                    step="0.5"
                                    placeholder="Hrs"
                                    value={row.hours}
                                    onChange={(e) => updateRow(i, "hours", e.target.value)}
                                    className={`myday-hours-input ${rowErrors[i] ? "input-error" : ""}`}
                                    title="Enter hours (e.g. 1.5 for 1h 30m)"
                                />
                                <input
                                    type="text"
                                    placeholder="Optional note"
                                    value={row.note}
                                    onChange={(e) => updateRow(i, "note", e.target.value)}
                                    className="myday-note-input"
                                />
                                <button
                                    className="myday-remove-btn"
                                    onClick={() => removeRow(i)}
                                    disabled={rows.length <= 1}
                                    title="Remove row"
                                >
                                    <i className="ri-close-line" aria-hidden="true"></i>
                                </button>
                            </div>
                            {rowErrors[i] && (
                                <span className="myday-row-error-msg">
                                    <i className="ri-alert-line" aria-hidden="true"></i> {rowErrors[i]}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                <button className="myday-add-btn" onClick={addRow} disabled={totalHours >= 24}>
                    + Add Activity
                </button>

                <div className="myday-form-footer">
                    <span className={`myday-total ${totalHours > 24 ? "myday-total-error" : ""}`}>
                        Total: {formatHoursToTime(totalHours)} / 24h
                        {remainingHours > 0 && totalHours > 0 && (
                            <span className="myday-remaining"> ({formatHoursToTime(remainingHours)} remaining)</span>
                        )}
                    </span>

                    {error && (
                        <span className="myday-error">
                            <i className="ri-alert-line" aria-hidden="true"></i> {error}
                        </span>
                    )}

                    <button
                        className="myday-save-btn"
                        onClick={handleSubmit}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : saved ? (
                            <>
                                <i className="ri-check-line" aria-hidden="true"></i>
                                Update My Day
                            </>
                        ) : "Save My Day"}
                    </button>
                </div>
            </div>

            {recommendations.length > 0 && (
                <div className="myday-reco-card">
                    <h4><i className="ri-pushpin-line" aria-hidden="true"></i> Recommendations</h4>
                    <ul className="myday-reco-list">
                        {recommendations.map((tip, i) => (
                            <li key={i} className="myday-reco-item">{tip}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default MyDay;
