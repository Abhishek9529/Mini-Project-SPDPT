const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");

// GET STUDENT BY ID
// Endpoint: GET /api/students/:id
// Returns student profile data (excluding password)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid student ID format" });
    }

    const student = await Student.findById(id).select("-password");

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.status(200).json({ student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, password, branch } = req.body;

    // --- Server-side validation ---
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Full name is required." });
    }
    if (/^\d+$/.test(name.trim())) {
      return res.status(400).json({ message: "Name cannot be only numbers." });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }
    if (!/(?=.*[a-zA-Z])/.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one letter." });
    }
    if (!/(?=.*\d)/.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one number." });
    }
    if (!/(?=.*[@$!%*?&_#-])/.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one special character." });
    }

    // check existing user
    const existingStudent = await Student.findOne({ email: email.trim().toLowerCase() });
    if (existingStudent) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    // NEW (hashed):
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStudent = new Student({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      branch
    });

    await newStudent.save();

    res.status(201).json({
      message: "Student registered successfully",
      student: newStudent
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE STUDENT PROFILE
// Endpoint: PUT /api/students/:id
// Updates student profile (name, branch, semester, careerGoal, password)
// Password is hashed before saving if provided
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: "Invalid student ID format"
      });
    }

    const { password, ...updateData } = req.body;

    // If password is provided, hash it before updating
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        error: "Student not found"
      });
    }

    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE STUDENT
// Endpoint: DELETE /api/students/:id
// Permanently removes a student from the database
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: "Invalid student ID format"
      });
    }

    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({
        error: "Student not found"
      });
    }

    res.status(200).json({
      message: "Student deleted successfully",
      student: deletedStudent
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
