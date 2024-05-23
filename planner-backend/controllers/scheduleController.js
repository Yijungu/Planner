const Schedule = require("../models/Schedule");
const moment = require("moment-timezone");

exports.addSchedule = async (req, res) => {
  try {
    const userId = req.user.userId; // 인증 미들웨어를 통해 설정된 userId
    const { startTime, endTime, event, color } = req.body;
    const schedule = new Schedule({
      userId,
      startTime,
      endTime,
      event,
      color,
    });
    await schedule.save();
    const updatedSchedule = {
      ...schedule.toObject(),
      startTime: moment(schedule.startTime).tz("Asia/Seoul").format(),
      endTime: moment(schedule.endTime).tz("Asia/Seoul").format(),
    };
    res.status(201).send(updatedSchedule);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.addBulkSchedules = async (req, res) => {
  try {
    const userId = req.user.userId;
    const schedules = req.body.map((schedule) => ({
      ...schedule,
      userId,
    }));
    const insertedSchedules = await Schedule.insertMany(schedules);
    const updatedSchedules = insertedSchedules.map((schedule) => ({
      ...schedule.toObject(),
      startTime: moment(schedule.startTime).tz("Asia/Seoul").format(),
      endTime: moment(schedule.endTime).tz("Asia/Seoul").format(),
    }));
    res.status(201).send(updatedSchedules);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByIdAndDelete(id);
    if (!schedule) {
      return res.status(404).send({ message: "Schedule not found" });
    }
    res
      .status(200)
      .send({ message: "Schedule deleted successfully", schedule });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getSchedulesByUserId = async (req, res) => {
  try {
    const userId = req.user.userId; // User ID from the authenticated token
    let schedules = await Schedule.find({ userId });
    const updatedSchedules = schedules.map((schedule) => ({
      ...schedule.toObject(),
      startTime: moment(schedule.startTime).tz("Asia/Seoul").format(),
      endTime: moment(schedule.endTime).tz("Asia/Seoul").format(),
    }));
    res.status(200).send(updatedSchedules);
  } catch (error) {
    res.status(500).send(error);
  }
};
