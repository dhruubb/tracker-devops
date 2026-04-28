const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  text: String,
  cat: String,
  done: Boolean,
  userId: String
});

module.exports = mongoose.model("Task", taskSchema);