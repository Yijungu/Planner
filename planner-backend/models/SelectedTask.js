//Task.js
const mongoose = require("mongoose");

const selectedTaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // userId를 ObjectId로 변경
    ref: "User", // 참조하는 모델 이름
    required: true,
  },
  title: String,
  description: String,
  dueDate: Date,
  color: String,
  selectedDate: Date,
  toSchedule: Boolean,
  taskId: {
    type: mongoose.Schema.Types.ObjectId, // userId를 ObjectId로 변경
    ref: "Task", // 참조하는 모델 이름
    required: true,
  },
  done: {
    type: Boolean,
    default: false,
  },
  finish: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("SelectedTask", selectedTaskSchema);
