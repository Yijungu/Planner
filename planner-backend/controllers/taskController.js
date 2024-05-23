const Task = require("../models/Task");
const moment = require("moment-timezone");

exports.addTask = async (req, res) => {
  try {
    const userId = req.user.userId; // 인증 미들웨어를 통해 설정된 userId
    const { title, dueDate, color } = req.body;
    const task = new Task({
      userId,
      title,
      dueDate,
      color,
    });
    await task.save();
    const updatedTask = {
      ...task.toObject(),
      dueDate: moment(task.dueDate).tz("Asia/Seoul").format(),
    };
    res.status(201).send(updatedTask);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.addBulkTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const tasks = req.body.map((task) => ({
      ...task,
      userId,
    }));
    const insertedTasks = await Task.insertMany(tasks);
    const updatedTasks = insertedTasks.map((task) => ({
      ...task.toObject(),
      dueDate: moment(task.dueDate).tz("Asia/Seoul").format(),
    }));
    res.status(201).send(updatedTasks);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).send({ message: "Task not found" });
    }
    res.status(200).send({ message: "Task deleted successfully", task });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).send({ message: "Task not found" });
    }

    switch (task.deleteOption) {
      case "immediate":
        task.done = true;
        await task.save();
        res
          .status(200)
          .send({ message: "Task marked as done immediately", task });
        break;
      case "delay":
        const newDueDate = new Date(
          task.dueDate.getTime() + 7 * 24 * 60 * 60 * 1000
        ); // 1주일 뒤로 미루기
        task.done = true;
        await task.save();

        const newTask = new Task({
          userId: task.userId,
          title: task.title,
          description: task.description,
          dueDate: newDueDate,
          color: task.color,
          deleteOption: task.deleteOption,
          done: false,
        });
        await newTask.save();

        res.status(200).send({
          message:
            "Task marked as done and new task created with delayed due date",
          task,
          newTask: {
            ...newTask.toObject(),
            dueDate: moment(newTask.dueDate).tz("Asia/Seoul").format(),
          },
        });
        break;
      case "keep":
        res.status(200).send({ message: "Task not marked as done", task });
        break;
      default:
        res.status(400).send({ message: "Invalid delete option" });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getTasksByUserId = async (req, res) => {
  try {
    const userId = req.user.userId; // User ID from the authenticated token
    let tasks = await Task.find({ userId });
    const updatedTasks = tasks.map((task) => ({
      ...task.toObject(),
      dueDate: moment(task.dueDate).tz("Asia/Seoul").format(),
    }));
    res.status(200).send(updatedTasks);
  } catch (error) {
    res.status(500).send(error);
  }
};
