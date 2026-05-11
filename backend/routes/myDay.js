const express = require("express");
const router = express.Router();
const MyDay = require("../models/MyDay");

// Productive category names (case-insensitive partial match)
const PRODUCTIVE_NAMES = [
    "study", "skills", "college", "coding", "code", "dsa", "programming",
    "project", "homework", "assignment", "lecture", "class", "lab",
    "reading", "research", "practice", "learn", "course", "tutorial",
    "exam", "test", "revision", "competitive", "development", "dev",
    "internship", "work", "training", "workshop", "seminar"
];


function calcProductivityScore(categories, totalHours) {
    if (!totalHours || totalHours === 0) return 0;
    const productiveHours = categories.reduce((sum, c) => {
        const name = (c.name || "").toLowerCase().trim();
        if (PRODUCTIVE_NAMES.some(p => name.includes(p))) {
            return sum + Number(c.hours || 0);
        }
        return sum;
    }, 0);
    return Math.round((productiveHours / totalHours) * 100);
}

// Helper: get today's date string in IST (YYYY-MM-DD)
function getTodayIST() {
    const now = new Date();
    // IST = UTC + 5:30
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    return istNow.toISOString().split("T")[0];
}

// Helper: get start and end of a date (in UTC) from a YYYY-MM-DD string
function getDayRange(dateStr) {
    const start = new Date(dateStr + "T00:00:00.000Z");
    const end = new Date(dateStr + "T23:59:59.999Z");
    return { start, end };
}

// POST today's data
router.post("/", async (req, res) => {
    try {
        const { studentId, categories } = req.body;

        // --- Server-side validation ---
        if (!studentId) {
            return res.status(400).json({ error: "studentId is required." });
        }
        if (!Array.isArray(categories) || categories.length === 0) {
            return res.status(400).json({ error: "categories must be a non-empty array." });
        }

        // Validate each category
        for (let i = 0; i < categories.length; i++) {
            const cat = categories[i];
            const name = (cat.name || "").trim();
            const hours = Number(cat.hours);

            if (!name) {
                return res.status(400).json({ error: `Category ${i + 1}: name is required.` });
            }
            // Reject purely numeric names
            if (/^\d+$/.test(name)) {
                return res.status(400).json({ error: `Category ${i + 1}: name cannot be only numbers. Please enter a meaningful activity name (e.g. "Sleep", "Study").` });
            }
            if (name.length < 2) {
                return res.status(400).json({ error: `Category ${i + 1}: name must be at least 2 characters.` });
            }
            if (isNaN(hours) || hours <= 0) {
                return res.status(400).json({ error: `Category ${i + 1}: hours must be a positive number.` });
            }
            if (hours > 24) {
                return res.status(400).json({ error: `Category ${i + 1}: hours cannot exceed 24.` });
            }
        }

        const totalHours = categories.reduce((a, b) => a + Number(b.hours), 0);
        if (totalHours > 24) {
            return res.status(400).json({ error: `Total hours (${totalHours.toFixed(2)}) cannot exceed 24.` });
        }

        const productivityScore = calcProductivityScore(categories, totalHours);

        // Use IST-aware today
        const todayStr = getTodayIST();
        const { start: dayStart, end: dayEnd } = getDayRange(todayStr);

        let myDay = await MyDay.findOne({
            studentId,
            date: { $gte: dayStart, $lte: dayEnd }
        });

        if (myDay) {
            // Update existing
            myDay.categories = categories;
            myDay.totalHours = totalHours;
            myDay.productivityScore = productivityScore;
            await myDay.save();
        } else {
            // Create new — store date as UTC midnight of the IST date
            myDay = await MyDay.create({
                studentId,
                date: new Date(todayStr + "T00:00:00.000Z"),
                categories,
                totalHours,
                productivityScore,
            });
        }

        res.json(myDay);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST historical data (for previous dates)
router.post("/historical", async (req, res) => {
    try {
        const { studentId, date, categories } = req.body;

        // Validate required fields
        if (!studentId || !date || !categories) {
            return res.status(400).json({
                error: "studentId, date (YYYY-MM-DD), and categories are required"
            });
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({
                error: "Invalid date format. Use YYYY-MM-DD (e.g., 2026-02-11)"
            });
        }

        // Prevent future dates
        const todayStr = getTodayIST();
        if (date > todayStr) {
            return res.status(400).json({
                error: "Cannot add data for future dates. Today is " + todayStr
            });
        }

        const totalHours = categories.reduce((a, b) => a + Number(b.hours), 0);
        const productivityScore = calcProductivityScore(categories, totalHours);

        const { start: dayStart, end: dayEnd } = getDayRange(date);

        let myDay = await MyDay.findOne({
            studentId,
            date: { $gte: dayStart, $lte: dayEnd }
        });

        if (myDay) {
            // Update existing
            myDay.categories = categories;
            myDay.totalHours = totalHours;
            myDay.productivityScore = productivityScore;
            await myDay.save();
        } else {
            // Create new
            myDay = await MyDay.create({
                studentId,
                date: new Date(date + "T00:00:00.000Z"),
                categories,
                totalHours,
                productivityScore,
            });
        }

        res.json(myDay);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET last 7 days MyDay data (weekly trend)
// NOTE: This route MUST be before /:studentId to avoid Express matching "week" as a studentId
router.get("/week/:studentId", async (req, res) => {
    try {
        const todayStr = getTodayIST();
        const todayDate = new Date(todayStr + "T23:59:59.999Z");

        const sevenDaysAgoDate = new Date(todayStr + "T00:00:00.000Z");
        sevenDaysAgoDate.setUTCDate(sevenDaysAgoDate.getUTCDate() - 6);

        const data = await MyDay.find({
            studentId: req.params.studentId,
            date: { $gte: sevenDaysAgoDate, $lte: todayDate }
        }).sort({ date: 1 });

        // console.log(`Weekly MyDay: found ${data.length} entries for ${req.params.studentId} (range: ${sevenDaysAgoDate.toISOString()} to ${todayDate.toISOString()})`);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET today's MyDay data
router.get("/:studentId", async (req, res) => {
    try {
        const todayStr = getTodayIST();
        const { start: dayStart, end: dayEnd } = getDayRange(todayStr);

        const data = await MyDay.findOne({
            studentId: req.params.studentId,
            date: { $gte: dayStart, $lte: dayEnd }
        });

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
