const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "lp_secret_key";

/* USERS (temporary – DB later) */
const users = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "hotel1", password: "hotel123", role: "hotel", hotel: "Grand Chennai" }
];

/* STORAGE (temporary – DB later) */
const dailyReports = [];

/* AUTH MIDDLEWARE */
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.sendStatus(401);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
}

/* LOGIN */
app.post("/login", (req, res) => {
  const user = users.find(
    u => u.username === req.body.username && u.password === req.body.password
  );
  if (!user) return res.status(401).send("Invalid");

  const token = jwt.sign(user, JWT_SECRET);
  res.json({ token, role: user.role });
});

/* DAILY REPORT SUBMISSION */
app.post("/daily-report", auth, (req, res) => {
  if (req.user.role !== "hotel") return res.sendStatus(403);

  const report = {
    hotel: req.user.hotel,
    date: new Date().toISOString().split("T")[0],
    ...req.body
  };

  dailyReports.push(report);
  console.log("📄 Daily Report:", report);

  res.send("Daily report submitted");
});

/* ADMIN – VIEW REPORTS */
app.get("/daily-report", auth, (req, res) => {
  if (req.user.role !== "admin") return res.sendStatus(403);
  res.json(dailyReports);
});

/* EMERGENCY */
const axios = require("axios");

app.post("/emergency", auth, async (req, res) => {
  const { category, severity, location } = req.body;

  const message = `🚨 EMERGENCY ALERT 🚨
Hotel: ${req.user.hotel}
Type: ${category}
Severity: ${severity}
Location: ${location}`;

  try {
    await axios.post("https://www.fast2sms.com/dev/bulkV2", {
      route: "q",
      message,
      numbers: "9884889138"
    }, {
      headers: {
        authorization: "nB4m0WS7FLhNHl81ofUCjIswctkvqbArVy9eJa3YPR6EKQzDgxaIYk1KDlxoRSPTmUuEO8fGAji5LXbW",
        "Content-Type": "application/json"
      }
    });

    console.log("SMS sent");
  } catch (err) {
    console.log("SMS failed", err.message);
  }

  res.send("Emergency logged & SMS triggered");
});
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`✅ LP Backend running on port ${PORT}`);
});
