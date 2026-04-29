// const mongoose = require("mongoose");

// const taskSchema = new mongoose.Schema({
//   text: String,
//   cat: String,
//   done: Boolean,
//   userId: String
// });

// module.exports = mongoose.model("Task", taskSchema);

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  text: String,
  cat: String,
  done: Boolean,
  userId: String,

  // 👇 NEW FIELD
  date: {
    type: String, // "2026-04-29"
    required: true
  }
});

module.exports = mongoose.model("Task", taskSchema);