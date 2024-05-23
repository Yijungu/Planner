const TaskToSchedule = require("../models/TaskToSchedule");
const moment = require("moment-timezone");

exports.addTaskToSchedule = async (req, res) => {
  try {
    const userId = req.user.userId; // 인증 미들웨어를 통해 설정된 userId
    const tasks = req.body; // Expecting an array of tasks
    const updatedTasks = [];

    for (let task of tasks) {
      let dbTask;
      if (task._id) {
        // _id가 있는 경우 업데이트
        dbTask = await TaskToSchedule.findOneAndUpdate(
          { _id: task._id, userId: userId },
          {
            $set: {
              startTime: task.startTime,
              endTime: task.endTime,
              targetTime: task.targetTime,
              event: task.event,
              color: task.color,
              taskId: task.taskId,
            },
          },
          { new: true, upsert: true }
        );
      } else {
        // _id가 없는 경우 새 문서 생성
        dbTask = new TaskToSchedule({
          ...task,
          userId: userId,
        });
        await dbTask.save();
      }

      if (dbTask) {
        updatedTasks.push(dbTask);
      }
    }

    // Adjust times to Seoul timezone
    const updatedTasksWithSeoulTime = updatedTasks.map((task) => ({
      ...task.toObject(),
      startTime: moment(task.startTime).tz("Asia/Seoul").format(),
      endTime: moment(task.endTime).tz("Asia/Seoul").format(),
      targetTime: moment(task.targetTime).tz("Asia/Seoul").format(),
    }));

    res.status(201).send(updatedTasksWithSeoulTime);
  } catch (error) {
    console.error("Error updating tasks:", error);
    res
      .status(400)
      .send({ error: "Failed to update tasks", details: error.message });
  }
};

exports.deleteTaskToSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const tasksToSchedules = await TaskToSchedule.findByIdAndDelete(id);
    if (!tasksToSchedules) {
      return res.status(404).send({ message: "Task to schedule not found" });
    }
    res.status(200).send({
      message: "Task to schedule deleted successfully",
      tasksToSchedules,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getTaskToScheduleByUserId = async (req, res) => {
  try {
    const userId = req.user.userId; // User ID from the authenticated token
    let tasksToSchedules = await TaskToSchedule.find({ userId });
    const updatedTasksToSchedules = tasksToSchedules.map((taskToSchedule) => ({
      ...taskToSchedule.toObject(),
      startTime: moment(taskToSchedule.startTime).tz("Asia/Seoul").format(),
      endTime: moment(taskToSchedule.endTime).tz("Asia/Seoul").format(),
      targetTime: moment(taskToSchedule.targetTime).tz("Asia/Seoul").format(),
    }));
    res.status(200).send(updatedTasksToSchedules);
  } catch (error) {
    res.status(500).send(error);
  }
};
