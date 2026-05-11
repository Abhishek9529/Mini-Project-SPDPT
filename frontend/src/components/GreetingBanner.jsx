import React from "react";
import "./GreetingBanner.css";
import { useNavigate } from "react-router-dom";

const GreetingBanner = ({ studentName = "Student", taskCount = 0 }) => {
    const navigate = useNavigate();

    // Dynamic greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    // Dynamic message based on task count
    const getMessage = () => {
        if (taskCount === 0) return "You're all caught up! Great job! 🎉";
        if (taskCount <= 2) return "Just a few tasks left. You've got this!";
        return "It's a productive day ahead! Let's get started!";
    };

    return (
        <div className="greeting-banner" id="greeting-banner">
            {/* Decorative background shapes */}
            <div className="greeting-bg-shape greeting-bg-shape-1"></div>
            <div className="greeting-bg-shape greeting-bg-shape-2"></div>

            <div className="greeting-content">
                <p className="greeting-hello">{getGreeting()},</p>
                <h2 className="greeting-name">{studentName}! 👋</h2>
                <p className="greeting-message">
                    You have <span className="greeting-highlight">{taskCount} pending {taskCount === 1 ? "task" : "tasks"}</span>.{" "}
                    {getMessage()}
                </p>
                <button className="greeting-btn" onClick={() => navigate("/tasks")}>
                    <span>Review Tasks</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <div className="greeting-illustration">
                {/* Inline SVG illustration of student at desk */}
                <svg viewBox="0 0 300 250" fill="none" xmlns="http://www.w3.org/2000/svg" className="greeting-svg">
                    {/* Desk */}
                    <rect x="60" y="160" width="180" height="8" rx="4" fill="#4f46e5" />
                    <rect x="80" y="168" width="8" height="50" rx="2" fill="#4338ca" />
                    <rect x="212" y="168" width="8" height="50" rx="2" fill="#4338ca" />

                    {/* Monitor */}
                    <rect x="120" y="100" width="70" height="55" rx="6" fill="#334155" />
                    <rect x="125" y="105" width="60" height="40" rx="3" fill="#1e293b" />
                    {/* Screen glow lines */}
                    <rect x="132" y="115" width="30" height="3" rx="1.5" fill="#6366f1" opacity="0.8" />
                    <rect x="132" y="122" width="40" height="3" rx="1.5" fill="#818cf8" opacity="0.5" />
                    <rect x="132" y="129" width="25" height="3" rx="1.5" fill="#6366f1" opacity="0.6" />
                    {/* Monitor stand */}
                    <rect x="148" y="155" width="14" height="8" rx="2" fill="#475569" />
                    <rect x="140" y="158" width="30" height="4" rx="2" fill="#475569" />

                    {/* Character body */}
                    {/* Head */}
                    <circle cx="210" cy="85" r="25" fill="#fbbf24" />
                    {/* Face */}
                    <circle cx="203" cy="82" r="2.5" fill="#1e293b" />
                    <circle cx="217" cy="82" r="2.5" fill="#1e293b" />
                    <path d="M206 92 Q210 97 214 92" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
                    {/* Hair */}
                    <path d="M188 75 Q195 55 215 58 Q235 60 237 78" fill="#1e293b" />
                    {/* Hat */}
                    <rect x="192" y="58" width="36" height="6" rx="3" fill="#6366f1" />
                    <rect x="200" y="40" width="20" height="20" rx="4" fill="#6366f1" />

                    {/* Torso */}
                    <rect x="197" y="108" width="26" height="35" rx="8" fill="#f1f5f9" />

                    {/* Waving arm (right) */}
                    <path d="M223 115 Q245 100 250 75" stroke="#fbbf24" strokeWidth="8" strokeLinecap="round" fill="none" />
                    {/* Hand */}
                    <circle cx="250" cy="72" r="6" fill="#fbbf24" />
                    {/* Fingers spread (waving) */}
                    <line x1="248" y1="66" x2="245" y2="60" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                    <line x1="251" y1="66" x2="251" y2="58" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                    <line x1="254" y1="67" x2="257" y2="61" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />

                    {/* Left arm on desk */}
                    <path d="M197 120 Q175 135 140 155" stroke="#fbbf24" strokeWidth="8" strokeLinecap="round" fill="none" />

                    {/* Legs */}
                    <rect x="200" y="140" width="10" height="30" rx="5" fill="#4338ca" />
                    <rect x="214" y="140" width="10" height="30" rx="5" fill="#4338ca" />
                    {/* Shoes */}
                    <ellipse cx="204" cy="172" rx="8" ry="5" fill="#1e293b" />
                    <ellipse cx="220" cy="172" rx="8" ry="5" fill="#1e293b" />

                    {/* Sparkle effects */}
                    <g className="sparkle sparkle-1">
                        <line x1="260" y1="55" x2="260" y2="45" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                        <line x1="255" y1="50" x2="265" y2="50" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                    </g>
                    <g className="sparkle sparkle-2">
                        <line x1="240" y1="45" x2="240" y2="38" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="236.5" y1="41.5" x2="243.5" y2="41.5" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" />
                    </g>

                    {/* Small plant on desk */}
                    <rect x="90" y="148" width="12" height="12" rx="3" fill="#6366f1" />
                    <circle cx="96" cy="142" r="8" fill="#22c55e" />
                    <circle cx="89" cy="145" r="5" fill="#16a34a" />
                    <circle cx="103" cy="145" r="5" fill="#16a34a" />

                    {/* Coffee cup */}
                    <rect x="100" y="148" width="16" height="12" rx="3" fill="#f1f5f9" opacity="0" />
                </svg>
            </div>
        </div>
    );
};

export default GreetingBanner;
