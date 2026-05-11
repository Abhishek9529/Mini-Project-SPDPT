import { useEffect, useState } from "react";
import API from "../services/api";
import "./Dashboard.css";
import MyDay from "../components/MyDay";
import WeeklyMyDayChart from "../components/WeeklyMyDayChart";
import TaskReminder from "../components/TaskReminder";
import GreetingBanner from "../components/GreetingBanner";
import UncompletedSubTasks from "../components/UncompletedSubTasks";
import CompletedSubTasks from "../components/CompletedSubTasks";
import SubjectProgressCards from "../components/SubjectProgressCards";
import GoalTaskStats from "../components/GoalTaskStats";
import TodaysLectures from "../components/TodaysLectures";
import GoalsProgress from "../components/GoalsProgress";
import useTaskReminder from "../hooks/useTaskReminder";
import { useTheme } from "../context/ThemeContext";

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function Dashboard() {
  const [data, setData] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [currentDay, setCurrentDay] = useState("");
  const [studentName, setStudentName] = useState("Student");
  const { isDark, toggleTheme } = useTheme();

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

  // Today's lecture sub-tasks grouped by subjectId
  const [lectureTasks, setLectureTasks] = useState({});
  const [activeSubtaskSubject, setActiveSubtaskSubject] = useState(null);
  const [expandedLectureSubjects, setExpandedLectureSubjects] = useState({});
  const [newSubtaskTitles, setNewSubtaskTitles] = useState({});
  const [weeklyRefreshKey, setWeeklyRefreshKey] = useState(0);

  // Today as YYYY-MM-DD
  const today = getLocalDateString();

  const getTaskSubjectId = (task) => {
    if (!task || !task.subjectId) return null;
    return typeof task.subjectId === "object" ? task.subjectId._id : task.subjectId;
  };

  const isSubjectTask = (task) => {
    return !!getTaskSubjectId(task) || task?.taskType === "lecture-subtask";
  };

  const buildLectureTaskMap = (tasks, subjects = []) => {
    const nextLectureTasks = {};
    subjects.forEach(sub => {
      if (sub?._id) nextLectureTasks[sub._id] = [];
    });

    tasks.forEach(task => {
      const subjectId = getTaskSubjectId(task);
      if (
        task.taskType !== "lecture-subtask" ||
        !subjectId ||
        !nextLectureTasks[subjectId] ||
        !isTodayDate(task.date)
      ) {
        return;
      }
      nextLectureTasks[subjectId].push(task);
    });

    Object.keys(nextLectureTasks).forEach(subjectId => {
      nextLectureTasks[subjectId].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    });

    return nextLectureTasks;
  };

  const handleNewSubtaskTitleChange = (subjectId, value) => {
    setNewSubtaskTitles(prev => ({ ...prev, [subjectId]: value }));
  };

  const toggleLectureDropdown = (subjectId) => {
    setExpandedLectureSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  const handleSubtaskKeyDown = (event, subject) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addLectureSubtask(subject);
    }

    if (event.key === "Escape") {
      setActiveSubtaskSubject(null);
    }
  };

  const addLectureSubtask = async (subject) => {
    const student = JSON.parse(localStorage.getItem("student"));
    if (!student || !subject?._id) return;

    const title = (newSubtaskTitles[subject._id] || "").trim();
    if (!title) {
      setActiveSubtaskSubject(subject._id);
      return;
    }

    if (/^\d+$/.test(title)) {
      alert("Sub-task title cannot be only numbers.");
      return;
    }

    if (title.length < 3) {
      alert("Sub-task title must be at least 3 characters.");
      return;
    }

    try {
      const res = await API.post("/tasks", {
        studentId: student._id,
        taskTitle: title,
        subjectId: subject._id,
        goalId: null,
        taskType: "lecture-subtask",
        isCompleted: false,
        date: today,
        deadline: today
      });

      setLectureTasks(prev => ({
        ...prev,
        [subject._id]: [...(prev[subject._id] || []), res.data.task]
      }));
      setExpandedLectureSubjects(prev => ({ ...prev, [subject._id]: true }));
      setNewSubtaskTitles(prev => ({ ...prev, [subject._id]: "" }));
      setActiveSubtaskSubject(null);
      refreshDashboard(student._id);
    } catch (err) {
      console.error("Error adding sub-task:", err);
      alert(err.response?.data?.error || "Failed to add sub-task");
    }
  };

  const toggleLectureSubtask = async (task) => {
    const student = JSON.parse(localStorage.getItem("student"));
    if (!student || !task?._id) return;

    const subjectId = getTaskSubjectId(task);
    try {
      const res = await API.put(`/tasks/${task._id}`, {
        isCompleted: !task.isCompleted
      });

      setLectureTasks(prev => ({
        ...prev,
        [subjectId]: (prev[subjectId] || []).map(item =>
          item._id === task._id ? { ...res.data.task, goalId: item.goalId } : item
        )
      }));
      refreshDashboard(student._id);
    } catch (err) {
      console.error("Error updating sub-task:", err);
      alert(err.response?.data?.error || "Failed to update sub-task");
    }
  };

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
  const refreshDashboard = (studentId, subjectsOverride = null) => {
    API.get(`/dashboard/${studentId}`)
      .then(res => setData(res.data))
      .catch(err => console.error("Dashboard data fetch error:", err));

    API.get(`/tasks/${studentId}`)
      .then(async res => {
        const allTasks = res.data.tasks || [];

        const subjectsForLectureTasks = subjectsOverride || timetable?.subjects || [];
        setLectureTasks(buildLectureTaskMap(allTasks, subjectsForLectureTasks));

        // Build per-goal progress from ALL goals
        try {
          const student = JSON.parse(localStorage.getItem("student"));
          if (student) {
            const goalsRes = await API.get(`/goals/${student._id}`);
            const fetchedGoals = goalsRes.data.goals || [];
            const goalsWithProgress = fetchedGoals.map(goal => {
              const goalTasks = allTasks.filter(t =>
                !isSubjectTask(t) &&
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
        // Note: General tasks without date are usually treated as "do it anytime", so maybe include them here or separate?
        // Assuming "Today" focus:
        const todaysPending = allTasks.filter(t =>
          !t.isCompleted &&
          !isSubjectTask(t) &&
          (!t.date || isTodayDate(t.date))
        );

        // 2. Backlog: Not completed AND date is Past
        const backlog = allTasks.filter(t =>
          !t.isCompleted &&
          !isSubjectTask(t) &&
          t.date &&
          isPastDate(t.date)
        );

        // 3. Completed History: Completed AND date is Past (or generally completed)
        // User asked for "Completed tasks component", let's put ALL completed tasks there for history reference?
        // Or just past ones. "jo us din ke subject the... unse dashboard pr mat show karna" imply removing past stuff from main view.
        // Let's put ALL completed tasks in history to keep main view clean, or just past ones.
        // Usually "Pending" vs "Completed" separation is good.
        // But user specifically said "us din ke subject... (past day subjects)... dashboard par mat show karna... completed task ke liye alag component".
        // This suggests Today's items should stay on dashboard.
        // So Today's Completed -> stay on timetable view.
        // Past Completed -> move to History component.
        const pastCompleted = allTasks.filter(t =>
          t.isCompleted &&
          !isSubjectTask(t) &&
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

        // Fetch today's timetable. Lecture sub-tasks are loaded from the task list below.
        let subjects = [];
        try {
          const ttRes = await API.get(`/timetable/${student._id}/${dayName}`);
          setTimetable(ttRes.data.timetable);
          subjects = ttRes.data.timetable?.subjects || [];
        } catch {
          setTimetable(null);
        }

        refreshDashboard(student._id, subjects);

      } catch (err) {
        console.error("Dashboard sync error:", err);
      }
    };

    syncDashboard();

    return () => {
      isCancelled = true;
    };
    // Run once on mount; refreshDashboard reads the latest fetched subjects passed above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // === Test: fire a notification right now ===
  const testNotification = async () => {
    if (!('Notification' in window)) {
      alert('Your browser does not support notifications.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('Please allow notifications first.');
      return;
    }

    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(`Good Morning, ${studentName}!`, {
        body:
          todayActionCount > 0 || backlogTasks.length > 0
            ? `You have ${todayActionCount} task(s) for today and ${backlogTasks.length} backlog item(s). Let's get started!`
            : "You're all caught up! Have a productive day.",
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'spdpt-test-notification',
        requireInteraction: false,
        actions: [
          { action: 'open', title: 'View Dashboard' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });
    } else {
      // Fallback: plain Notification API
      new Notification(`Good Morning, ${studentName}!`, {
        body:
          todayActionCount > 0 || backlogTasks.length > 0
            ? `You have ${todayActionCount} task(s) for today and ${backlogTasks.length} backlog item(s). Let's get started!`
            : "You're all caught up! Have a productive day.",
        icon: '/vite.svg'
      });
    }
  };

  if (!data) return <h3 className="loading-text">Loading dashboard...</h3>;

  const todaysLectureSubjects = timetable?.subjects || [];
  const getLectureTasks = (subjectId) => lectureTasks[subjectId] || [];
  const subjectSubTasks = todaysLectureSubjects.flatMap(sub =>
    getLectureTasks(sub._id).map(task => ({
      ...task,
      subjectName: sub.subjectName,
      semester: sub.semester
    }))
  );
  const subjectProgressItems = todaysLectureSubjects.map(sub => {
    const tasks = getLectureTasks(sub._id);
    const completed = tasks.filter(task => task.isCompleted).length;
    const total = tasks.length;
    const pending = total - completed;

    return {
      id: sub._id,
      name: sub.subjectName,
      total,
      completed,
      pending,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  });
  const pendingSubjectSubTasks = subjectSubTasks.filter(task => !task.isCompleted);
  const completedSubjectSubTasks = subjectSubTasks.filter(task => task.isCompleted);
  const todayActionCount = pendingTasks.length + pendingSubjectSubTasks.length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h2>Student Dashboard</h2>
        <div className="dashboard-header-actions">
          <button
            type="button"
            className="dashboard-theme-btn"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <i className={isDark ? "ri-sun-line" : "ri-moon-line"} aria-hidden="true"></i>
          </button>
          <button
            type="button"
            onClick={testNotification}
            className="dashboard-notification-btn"
            title="Preview morning notification"
          >
            <i className="ri-notification-3-line" aria-hidden="true"></i>
            Test Notification
          </button>
        </div>
      </div>

      {/* ===== Morning Smart Reminder Banner ===== */}
      <TaskReminder
        studentName={studentName}
        pendingCount={todayActionCount}
        backlogCount={backlogTasks.length}
      />

      <GreetingBanner studentName={studentName} taskCount={todayActionCount} />

      <GoalTaskStats
        goals={allGoals}
        totalSubjects={data.totalSubjects}
        totalGoals={data.totalGoals}
      />

      <SubjectProgressCards subjects={subjectProgressItems} />

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
        <TodaysLectures
          currentDay={currentDay}
          timetable={timetable}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          backlogTasks={backlogTasks}
          completedHistory={completedHistory}
          getLectureTasks={getLectureTasks}
          activeSubtaskSubject={activeSubtaskSubject}
          setActiveSubtaskSubject={setActiveSubtaskSubject}
          expandedLectureSubjects={expandedLectureSubjects}
          toggleLectureDropdown={toggleLectureDropdown}
          newSubtaskTitles={newSubtaskTitles}
          handleNewSubtaskTitleChange={handleNewSubtaskTitleChange}
          handleSubtaskKeyDown={handleSubtaskKeyDown}
          addLectureSubtask={addLectureSubtask}
          toggleLectureSubtask={toggleLectureSubtask}
        />

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

      <div className="subject-subtasks-grid">
        <UncompletedSubTasks tasks={pendingSubjectSubTasks} />
        <CompletedSubTasks tasks={completedSubjectSubTasks} />
      </div>
    </div>
  );
}

export default Dashboard;
