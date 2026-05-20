require("dotenv").config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

const parseOrigins = (value) =>
    value
        ? value.split(",").map((origin) => origin.trim().replace(/\/$/, "")).filter(Boolean)
        : [];

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
    ...parseOrigins(process.env.FRONTEND_URLS)
]
    .filter(Boolean)
    .map((origin) => origin.replace(/\/$/, ""));

const isAllowedOrigin = (origin) => {
    if (!origin) return true;

    const normalizedOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(normalizedOrigin)) return true;

    try {
        const { hostname } = new URL(normalizedOrigin);
        return hostname === "localhost" || hostname.endsWith(".vercel.app") || hostname.endsWith(".onrender.com");
    } catch {
        return false;
    }
};

// Enable CORS for frontend
app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));
const connectDB = require('../backend/config/db.js');
const studentRoutes = require('../backend/routes/students.js');
const subjectRoutes = require('../backend/routes/subjects.js');
const goalRoutes = require('../backend/routes/goals.js');
const actionPlanRoutes = require("../backend/routes/actionsPlans.js");
const taskRoutes = require('../backend/routes/tasks.js');
const progressRoutes = require('../backend/routes/progress.js');
const authRoutes = require('../backend/routes/auth.js');
const authMiddleware = require('../backend/middleware/auth.js');
const dashboardRoutes = require('../backend/routes/dashboard.js');
const timetableRoutes = require('../backend/routes/timetable.js');
const myDayRoutes = require('../backend/routes/myDay.js');



// after this error :- {"error":"Cannot destructure property 'name' of 'req.body' as it is undefined."}
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB connection middleware for serverless deployments.
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(503).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});


// root route
app.get("/", (req, res) => {
    res.send("server sucessfully created...");
})

// ===== PUBLIC ROUTES (no token needed) =====
// auth route for login 
app.use("/api/auth", authRoutes);

// register route — POST /api/students is public, but GET/PUT/DELETE need auth
app.use('/api/students', (req, res, next) => {
    if (req.method === "POST") return next();
    return authMiddleware(req, res, next);
}, studentRoutes);

// ===== PROTECTED ROUTES (token required) =====
app.use('/api/subjects', authMiddleware, subjectRoutes);
app.use('/api/goals', authMiddleware, goalRoutes);
app.use('/api/actionPlans', authMiddleware, actionPlanRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/progress', authMiddleware, progressRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use('/api/timetable', authMiddleware, timetableRoutes);
app.use("/api/myday", authMiddleware, myDayRoutes);

// protected test route
app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({
        message: "Protected route accessed",
        studentId: req.student.id
    });
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`server is running on ${port}`);
    });
}

module.exports = app;
