const mongoose = require("mongoose");
//Schedule.js
const taskToScheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // userId를 ObjectId로 변경
    ref: "User", // 참조하는 모델 이름
    required: true,
  },
  startTime: Date,
  endTime: Date,
  targetTime: Date,
  event: String,
  color: String,
  taskId: {
    type: mongoose.Schema.Types.ObjectId, // userId를 ObjectId로 변경
    ref: "SelectedTask", // 참조하는 모델 이름
    required: true,
  },
});

module.exports = mongoose.model("TaskToSchedule", taskToScheduleSchema);
