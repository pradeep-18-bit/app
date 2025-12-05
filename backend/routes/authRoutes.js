const express = require("express");
const User = require("../models/User");
const router = express.Router();

// ✅ Register
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // ✅ Password validation (AT LEAST ONE UPPERCASE)
  if (!/(?=.*[A-Z])/.test(password)) {
    return res.status(400).json({
      message: "Password must contain at least one uppercase letter"
    });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = new User({ email, password });
  await user.save();

  res.json({ message: "User registered successfully" });
});

// ✅ Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    token: "dummy-jwt-token",
    user
  });
});

module.exports = router;
