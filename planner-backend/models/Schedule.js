const mongoose = require("mongoose");
//Schedule.js
const scheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // userId를 ObjectId로 변경
    ref: "User", // 참조하는 모델 이름
    required: true,
  },
  startTime: Date,
  endTime: Date,
  event: String,
  color: String,
});

module.exports = mongoose.model("Schedule", scheduleSchema);
