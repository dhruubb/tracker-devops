require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Task = require("./models/Task");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// ✅ Use ONE variable name
const promClient = require('prom-client');

// collect default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics();


// ── Custom Metrics ──

// Request count
const httpRequests = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Request duration
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.3, 0.5, 1, 2]
});


// ── Middleware ──

// Count requests
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequests
      .labels(req.method, req.path, res.statusCode)
      .inc();
  });
  next();
});

// Measure duration
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path });
  });
  next();
});


// ── Metrics Route ──

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
// example: tests/auth.test.js

// ===== DB CONNECT =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ DB Error:", err));


// ===== AUTH MIDDLEWARE =====
function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header)
    return res.status(401).json({ message: "No token provided" });

  const token = header.startsWith("Bearer ")
    ? header.split(" ")[1]
    : header;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
}


// ===== AUTH =====

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    await User.create({ email, password: hashed });

    res.json({ message: "User created" });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ===== TASKS =====

// GET tasks
app.get("/tasks", auth, async (req, res) => {
    try {
      const { date } = req.query;
  
      let filter = { userId: req.user.id };
  
      if (date) {
        filter.date = date; // 👈 filter by selected date
      }
  
      const tasks = await Task.find(filter).sort({ createdAt: -1 });
  
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });


// ADD task
app.post("/tasks", auth, async (req, res) => {
    try {
      const { text, cat, date } = req.body;
  
      if (!text || !text.trim())
        return res.status(400).json({ message: "Text required" });
  
      const today = new Date();
      const localDate = today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");
  
      const task = await Task.create({
        text,
        cat: cat || "task",
        done: false,
        userId: req.user.id,
        date: date || localDate
      });
  
      res.json(task);
    } catch (err) {
      res.status(500).json({ message: "Error creating task" });
    }
  });


// TOGGLE task
app.put("/tasks/:id", auth, async (req, res) => {
    try {
      const task = await Task.findOne({
        _id: req.params.id,
        userId: req.user.id
      });
  
      if (!task)
        return res.status(404).json({ message: "Task not found" });
  
      task.done = !task.done;
      await task.save();
  
      res.json(task); // 👈 better
    } catch (err) {
      res.status(500).json({ message: "Error updating task" });
    }
  });


// DELETE task
app.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!task)
      return res.status(404).json({ message: "Task not found" });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error deleting task" });
  }
});


const PORT = 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}

module.exports = app;