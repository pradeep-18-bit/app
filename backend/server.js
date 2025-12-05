const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ CORS FIX (VERY IMPORTANT)
app.use(cors({
  origin: "*",   // allow frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/Auth", authRoutes);

// test route
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend running ✅" });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch(err => console.error(err));
