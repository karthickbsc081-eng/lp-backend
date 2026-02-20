const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "lp_secret_key";

const users = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "hotel1", password: "hotel123", role: "hotel", hotel: "Grand Chennai" }
];

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

app.post("/login", (req, res) => {
  const user = users.find(
    u => u.username === req.body.username && u.password === req.body.password
  );
  if (!user) return res.status(401).send("Invalid");

  const token = jwt.sign(user, JWT_SECRET);
  res.json({ token, role: user.role });
});

app.post("/emergency", auth, (req, res) => {
  console.log("🚨 EMERGENCY:", req.body, "Hotel:", req.user.hotel);
  res.send("Emergency logged");
});

app.get("/", (req, res) => {
  res.send("Loss Prevention Backend Running");
});

app.listen(3000, () => console.log("Server started"));
