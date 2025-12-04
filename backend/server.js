const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB
connectDB();

// ✅ Routes
app.use("/api/Auth", require("./routes/authRoutes"));

// ✅ Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend running ✅" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Backend running on port ${PORT}`)
);
