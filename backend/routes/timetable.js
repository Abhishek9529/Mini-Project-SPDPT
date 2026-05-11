const express = require("express");
const router = express.Router();
const Timetable = require("../models/Timetable");

// CREATE TIMETABLE ENTRY (If not exists) OR UPDATE (If exists)
// Endpoint: POST /api/timetable
// Body: { studentId, day, subjects: [subjectId1, subjectId2, ...] }
router.post("/", async (req, res) => {
    try {
        const { studentId, day, subjects } = req.body;

        let timetable = await Timetable.findOne({ studentId, day });

        if (timetable) {
            // Update existing
            // distinct subjects
            const newSubjects = subjects || [];
            newSubjects.forEach(subId => {
                timetable.subjects.addToSet(subId);
            });
            await timetable.save();
        } else {
            // Create new
            timetable = new Timetable(req.body);
            await timetable.save();
        }

        res.status(201).json({
            message: "Timetable entry updated successfully",
            timetable
        });

    } catch (err) {
        if (err.code === 11000) {
            // Handle unique constraint if any (though logic handles findOne)
            return res.status(400).json({ error: "Timetable entry already exists" });
        }
        res.status(500).json({ error: err.message });
    }
});

// ADD SINGLE SUBJECT TO TIMETABLE DAY
// Endpoint: POST /api/timetable/add-subject
// Body: { studentId, day, subjectId }
router.post("/add-subject", async (req, res) => {
    try {
        const { studentId, day, subjectId } = req.body;

        if (!studentId || !day || !subjectId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        let timetable = await Timetable.findOne({ studentId, day });

        if (timetable) {
            timetable.subjects.addToSet(subjectId);
            await timetable.save();
        } else {
            timetable = new Timetable({
                studentId,
                day,
                subjects: [subjectId]
            });
            await timetable.save();
        }

        // Populate to return full details
        await timetable.populate("subjects");

        res.status(200).json({
            message: "Subject added to timetable successfully",
            timetable
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET TIMETABLE BY DAY FOR A STUDENT
// Endpoint: GET /api/timetable/:studentId/:day
// Returns the timetable for a specific day with populated subject details
router.get("/:studentId/:day", async (req, res) => {
    try {
        const { studentId, day } = req.params;

        // Validate ObjectId format
        if (!studentId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: "Invalid student ID format"
            });
        }

        const timetable = await Timetable.findOne({ studentId, day })
            .populate("subjects");

        if (!timetable) {
            return res.status(404).json({
                error: "No timetable found for this day"
            });
        }

        res.status(200).json({
            message: "Timetable retrieved successfully",
            timetable
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ALL TIMETABLE ENTRIES FOR A STUDENT
// Endpoint: GET /api/timetable/:studentId
// Returns the full weekly timetable with populated subject details
router.get("/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;

        // Validate ObjectId format
        if (!studentId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: "Invalid student ID format"
            });
        }

        const timetable = await Timetable.find({ studentId })
            .populate("subjects");

        res.status(200).json({
            message: "Timetable retrieved successfully",
            count: timetable.length,
            timetable
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE TIMETABLE ENTRY
// Endpoint: PUT /api/timetable/:id
// Updates the timetable entry (e.g. change subjects for a day)
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: "Invalid timetable ID format"
            });
        }

        const updatedTimetable = await Timetable.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        ).populate("subjects");

        if (!updatedTimetable) {
            return res.status(404).json({
                error: "Timetable entry not found"
            });
        }

        res.status(200).json({
            message: "Timetable updated successfully",
            timetable: updatedTimetable
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE TIMETABLE ENTRY
// Endpoint: DELETE /api/timetable/:id
// Permanently removes a timetable entry
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: "Invalid timetable ID format"
            });
        }

        const deletedTimetable = await Timetable.findByIdAndDelete(id);

        if (!deletedTimetable) {
            return res.status(404).json({
                error: "Timetable entry not found"
            });
        }

        res.status(200).json({
            message: "Timetable entry deleted successfully",
            timetable: deletedTimetable
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
