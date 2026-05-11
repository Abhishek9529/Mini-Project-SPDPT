import { useEffect, useState } from "react";
import API from "../services/api";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from "chart.js";
import { useTheme } from "../context/ThemeContext";
import "./WeeklyMyDayChart.css";

// Register Chart.js components for bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function WeeklyMyDayChart({ refreshKey }) {
    const [weekData, setWeekData] = useState([]);
    const { isDark } = useTheme();
    const styles = getComputedStyle(document.documentElement);
    const mutedText = styles.getPropertyValue("--text-muted").trim() || (isDark ? "#94a3b8" : "#64748b");
    const gridColor = isDark ? "rgba(148, 163, 184, 0.18)" : "rgba(51, 65, 85, 0.16)";

    const fetchWeekly = () => {
        const student = JSON.parse(localStorage.getItem("student"));
        if (!student) return;

        API.get(`/myday/week/${student._id}`)
            .then(res => {
                console.log("Weekly MyDay response:", res.data);
                setWeekData(res.data || []);
            })
            .catch(err => console.log("Weekly fetch error:", err));
    };

    useEffect(() => {
        fetchWeekly();
    }, [refreshKey]);

    if (weekData.length === 0) {
        return (
            <div className="weekly-chart-section">
                <h3><i className="ri-line-chart-line" aria-hidden="true"></i> Weekly Productivity Trend</h3>
                <p className="weekly-placeholder">
                    No MyDay data yet. Start logging your daily hours to see weekly trends!
                </p>
            </div>
        );
    }

    // Build chart labels
    const labels = weekData.map(entry => {
        const d = new Date(entry.date);
        return `${DAY_NAMES[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
    });

    const PRODUCTIVE_NAMES = [
        "study", "skills", "college", "coding", "code", "dsa", "programming",
        "project", "homework", "assignment", "lecture", "class", "lab",
        "reading", "research", "practice", "learn", "course", "tutorial",
        "exam", "test", "revision", "competitive", "development", "dev",
        "internship", "work", "training", "workshop", "seminar"
    ];

    // Use stored productivityScore if it exists; fallback recalculation for old records
    const getScore = (entry) => {
        if (entry.productivityScore !== undefined && entry.productivityScore !== null) {
            return entry.productivityScore;
        }
        // Fallback: calculate from categories
        const cats = entry.categories || [];
        const total = entry.totalHours || cats.reduce((s, c) => s + (Number(c.hours) || 0), 0);
        if (total === 0) return 0;
        const productive = cats
            .filter(c => PRODUCTIVE_NAMES.some(p => (c.name || "").toLowerCase().includes(p)))
            .reduce((s, c) => s + (Number(c.hours) || 0), 0);
        return Math.round((productive / total) * 100);
    };

    const scores = weekData.map(entry => getScore(entry));

    const chartData = {
        labels,
        datasets: [{
            label: "Productivity Score (%)",
            data: scores,
            backgroundColor: scores.map(s =>
                s >= 60 ? "rgba(34, 197, 94, 0.7)"
                    : s >= 40 ? "rgba(245, 158, 11, 0.7)"
                        : "rgba(239, 68, 68, 0.7)"
            ),
            borderColor: scores.map(s =>
                s >= 60 ? "#22c55e" : s >= 40 ? "#f59e0b" : "#ef4444"
            ),
            borderWidth: 2,
            borderRadius: 6,
            maxBarThickness: 50
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => ` Score: ${ctx.parsed.y}%`,
                    afterLabel: (ctx) => {
                        const entry = weekData[ctx.dataIndex];
                        if (entry && entry.totalHours) {
                            return `Total: ${entry.totalHours}h logged`;
                        }
                        return "";
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    color: mutedText,
                    callback: (v) => v + "%"
                },
                grid: {
                    color: gridColor
                }
            },
            x: {
                ticks: { color: mutedText },
                grid: { display: false }
            }
        }
    };

    // Average score
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    return (
        <div className="weekly-chart-section">
            <div className="weekly-chart-header">
                <h3><i className="ri-line-chart-line" aria-hidden="true"></i> Weekly Productivity Trend</h3>
                <span className="weekly-avg-badge">
                    Avg: {avg}%
                </span>
            </div>
            <div className="weekly-chart-container">
                <Bar data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}

export default WeeklyMyDayChart;
