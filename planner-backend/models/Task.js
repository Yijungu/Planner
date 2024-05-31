const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // userId를 ObjectId로 변경
    ref: "User", // 참조하는 모델 이름
    required: true,
  },
  title: String,
  dueDate: Date,
  color: {
    type: String,
    default: "1",
  },
  deleteOption: {
    type: String,
    enum: ["immediate", "delay", "keep"],
    default: "immediate",
  },
  done: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Task", taskSchema);
