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
    const tasks = await Task.find({ userId: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});


// ADD task
app.post("/tasks", auth, async (req, res) => {
  try {
    const { text, cat } = req.body;

    if (!text)
      return res.status(400).json({ message: "Text required" });

    const task = await Task.create({
      text,
      cat: cat || "task",
      done: false,
      userId: req.user.id
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

    res.json({ success: true });
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


app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});