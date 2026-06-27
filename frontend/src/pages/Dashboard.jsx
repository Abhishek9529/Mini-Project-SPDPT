import { useEffect, useState } from "react";
import API from "../services/api";
import "./Dashboard.css";
import MyDay from "../components/MyDay";
import WeeklyMyDayChart from "../components/WeeklyMyDayChart";
import TaskReminder from "../components/TaskReminder";
import GreetingBanner from "../components/GreetingBanner";
import GoalTaskStats from "../components/GoalTaskStats";
import GoalsProgress from "../components/GoalsProgress";
import useTaskReminder from "../hooks/useTaskReminder";
import { useTheme } from "../context/ThemeContext";
import UncompletedTasks from "../components/UncompletedTasks";
import CompletedTasks from "../components/CompletedTasks";

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function Dashboard() {
  const [data, setData] = useState(null);
  const [currentDay, setCurrentDay] = useState("");
  const [studentName, setStudentName] = useState("Student");
  const { isDark } = useTheme();

  // Schedule morning push notification via Service Worker
  useTaskReminder(studentName);

  // Task Categories
  const [pendingTasks, setPendingTasks] = useState([]); // Today's pending
  const [backlogTasks, setBacklogTasks] = useState([]); // Past uncompleted
  const [completedHistory, setCompletedHistory] = useState([]); // Past completed

  const [selectedGoalType, setSelectedGoalType] = useState(null);

  // All goals with dynamic progress
  const [allGoals, setAllGoals] = useState([]); // [{ goal, progress, tasks }]

  const [showHistory, setShowHistory] = useState(false);
  const [weeklyRefreshKey, setWeeklyRefreshKey] = useState(0);

  // Today as YYYY-MM-DD
  const today = getLocalDateString();

  // Helper to check if a date string is strictly before today (YYYY-MM-DD comparison)
  const isPastDate = (dateStr) => {
    if (!dateStr) return false;
    const tDate = dateStr.split("T")[0];
    return tDate < today;
  };

  // Helper to check if a date string is strictly today
  const isTodayDate = (dateStr) => {
    if (!dateStr) return false;
    const tDate = dateStr.split("T")[0];
    return tDate === today;
  };

  // ---- Refresh stats + progress bars ----
  const refreshDashboard = (studentId) => {
    API.get(`/dashboard/${studentId}`)
      .then(res => setData(res.data))
      .catch(err => console.error("Dashboard data fetch error:", err));

    API.get(`/tasks/${studentId}`)
      .then(async res => {
        const allTasks = res.data.tasks || [];

        // Build per-goal progress from ALL goals
        try {
          const student = JSON.parse(localStorage.getItem("student"));
          if (student) {
            const goalsRes = await API.get(`/goals/${student._id}`);
            const fetchedGoals = goalsRes.data.goals || [];
            const goalsWithProgress = fetchedGoals.map(goal => {
              const goalTasks = allTasks.filter(t =>
                t.goalId &&
                (t.goalId._id === goal._id || t.goalId === goal._id)
              );
              const done = goalTasks.filter(t => t.isCompleted).length;
              const progress = goalTasks.length > 0 ? Math.round((done / goalTasks.length) * 100) : 0;
              return { goal, tasks: goalTasks, progress };
            });
            setAllGoals(goalsWithProgress);
          }
        } catch (e) {
          console.error("Goals refresh error:", e);
        }

        // Filter Tasks into Logic Buckets
        // 1. Today's Pending: Not completed AND (date is Today OR no date i.e. general tasks)
        const todaysPending = allTasks.filter(t =>
          !t.isCompleted &&
          (!t.date || isTodayDate(t.date))
        );

        // 2. Backlog: Not completed AND date is Past
        const backlog = allTasks.filter(t =>
          !t.isCompleted &&
          t.date &&
          isPastDate(t.date)
        );

        // 3. Completed History: Completed AND date is Past (or generally completed)
        const pastCompleted = allTasks.filter(t =>
          t.isCompleted &&
          t.date &&
          isPastDate(t.date)
        );

        setPendingTasks(todaysPending);
        setBacklogTasks(backlog);
        setCompletedHistory(pastCompleted);
      })
      .catch(err => console.error("Tasks fetch error:", err));
  };

  useEffect(() => {
    let isCancelled = false;

    const syncDashboard = async () => {
      const student = JSON.parse(localStorage.getItem("student"));
      if (!student) return;

      setStudentName(student.fullName || student.name || student.firstName || "Student");

      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = days[new Date().getDay()];
      setCurrentDay(dayName);

      try {
        if (isCancelled) return;



        refreshDashboard(student._id);

      } catch (err) {
        console.error("Dashboard sync error:", err);
      }
    };

    syncDashboard();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (!data) return <h3 className="loading-text">Loading dashboard...</h3>;

  const todayActionCount = pendingTasks.length;

  return (
    <div className="dashboard-page">

      {/* ===== Morning Smart Reminder Banner ===== */}
      <TaskReminder
        studentName={studentName}
        pendingCount={todayActionCount}
        backlogCount={backlogTasks.length}
      />

      <GreetingBanner studentName={studentName} taskCount={todayActionCount} />

      <GoalTaskStats
        goals={allGoals}
        totalGoals={data.totalGoals}
      />

      {/* ===== Goals Progress Section ===== */}
      <GoalsProgress
        allGoals={allGoals}
        selectedGoalType={selectedGoalType}
        setSelectedGoalType={setSelectedGoalType}
      />

      {/* ===== MyDay: Dual Pie Charts + Hour Logger ===== */}
      <MyDay onSave={() => setWeeklyRefreshKey(k => k + 1)} />

      {/* ===== Weekly Productivity Trend ===== */}
      <WeeklyMyDayChart refreshKey={weeklyRefreshKey} />

      {/* ===== Timetable + Pending Tasks Grid ===== */}
      <div className="dashboard-content-grid">
        <div className="dashboard-timetable-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3>Task History</h3>
            <button
              className="view-tasks-btn"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Hide History" : "Show History"}
            </button>
          </div>

          {showHistory ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <UncompletedTasks tasks={backlogTasks} />
              <CompletedTasks tasks={completedHistory} />
            </div>
          ) : (
            <p className="no-schedule-text">Click 'Show History' to view your backlog and completed tasks.</p>
          )}
        </div>

        <div className="dashboard-pending-section">
          <h3><i className="ri-clipboard-line" aria-hidden="true"></i> Today's Pending Tasks</h3>
          {pendingTasks.length > 0 ? (
            <ul className="pending-task-list">
              {pendingTasks.map(task => (
                <li key={task._id} className="pending-task-item">
                  <span className="pending-task-title">{task.taskTitle}</span>
                  {task.goalId && task.goalId.type && (
                    <span className={`goal-type-badge ${task.goalId.type}`}>
                      {task.goalId.type}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-schedule-text">No other pending tasks for today.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
