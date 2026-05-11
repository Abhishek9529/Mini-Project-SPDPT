const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Normalize email to lowercase — registration stores it lowercase
        const normalizedEmail = email.trim().toLowerCase();

        const student = await Student.findOne({ email: normalizedEmail });

        if (!student) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: student._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const studentData = student.toObject();
        delete studentData.password;

        res.status(200).json({
            message: "Login successful",
            token,
            student: studentData
        });


    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
