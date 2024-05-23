const mongoose = require("mongoose");
const SelectedTask = require("../models/SelectedTask");
const Task = require("../models/Task");
const moment = require("moment-timezone");

exports.addSelectedTask = async (req, res) => {
  try {
    const { selectedDate, tasks } = req.body;
    const dateOfInterest = moment(selectedDate).startOf("day").toDate();
    const nextDay = moment(selectedDate).add(1, "day").startOf("day").toDate();

    // 해당 날짜에 있는 모든 SelectedTasks를 찾습니다.
    const existingTasks = await SelectedTask.find({
      selectedDate: {
        $gte: dateOfInterest,
        $lt: nextDay,
      },
    });
    console.log("existingTasks", existingTasks);
    // 새로운 작업의 _id 목록을 생성합니다.
    const newTaskIds = tasks.map((task) => task.taskId.toString());
    const existingTaskIds = existingTasks.map((task) => task.taskId.toString());
    // 새 작업 중 기존에 없는 작업을 추가합니다.
    const tasksToAdd = tasks.filter(
      (task) => !existingTaskIds.includes(task.taskId.toString())
    );
    console.log("tasksToAdd", tasksToAdd);
    // 기존 작업 중 새 작업에 없는 작업을 삭제합니다.
    const tasksToDelete = existingTasks.filter(
      (task) => !newTaskIds.includes(task.taskId.toString())
    );
    console.log("tasksToDelete", tasksToDelete);
    const taskIdsToDelete = tasksToDelete.map((task) => task._id);

    // 삭제 실행
    await SelectedTask.deleteMany({
      _id: { $in: taskIdsToDelete },
      done: false,
      finish: false,
    });

    await mongoose.model("TaskToSchedule").deleteMany({
      taskId: { $in: taskIdsToDelete },
    });
    tasksToAdd.forEach((task) => {
      if (!moment(task.dueDate, moment.ISO_8601, true).isValid()) {
        task.dueDate = null; // 또는 기본 날짜 설정 예: new Date()
      }
    });

    // 삭제된 작업의 정보 저장
    // 추가 실행
    const addedTasks = await SelectedTask.insertMany(tasksToAdd);

    const allTasks = await SelectedTask.find();
    // 최종 데이터를 읽어 다시 전송

    res.status(201).send({
      allTasks: allTasks.map((task) => ({
        ...task.toObject(),
        dueDate: moment(task.dueDate).tz("Asia/Seoul").format(),
        selectedDate: moment(task.selectedDate).tz("Asia/Seoul").format(),
      })),
      deletedTasks: tasksToDelete.map((task) => ({
        ...task.toObject(), // 직접 객체 데이터 접근
        dueDate: moment(task.dueDate).tz("Asia/Seoul").format(),
        selectedDate: moment(task.selectedDate).tz("Asia/Seoul").format(),
      })),
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).send(error);
  }
};

exports.deleteSelectedTask = async (req, res) => {
  try {
    const { id } = req.params;
    const selectedTask = await SelectedTask.findByIdAndDelete(id);
    if (!selectedTask) {
      return res.status(404).send({ message: "Selected Task not found" });
    }
    res
      .status(200)
      .send({ message: "Selected Task deleted successfully", selectedTask });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getSelectedTasksByUserId = async (req, res) => {
  try {
    const userId = req.user.userId; // User ID from the authenticated token
    let selectedTasks = await SelectedTask.find({ userId });
    const updatedSelectedTasks = selectedTasks.map((task) => ({
      ...task.toObject(),
      dueDate: moment(task.dueDate).tz("Asia/Seoul").format(),
      selectedDate: moment(task.selectedDate).tz("Asia/Seoul").format(),
    }));
    res.status(200).send(updatedSelectedTasks);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.toggleSelectedTask = async (req, res) => {
  try {
    const { id } = req.params;
    const selectedTask = await SelectedTask.findById(id);
    if (!selectedTask) {
      return res.status(404).send({ message: "Selected Task not found" });
    }

    // toSchedule 속성 토글
    selectedTask.toSchedule = !selectedTask.toSchedule;
    await selectedTask.save();

    const updatedTask = {
      ...selectedTask.toObject(),
      dueDate: moment(selectedTask.dueDate).tz("Asia/Seoul").format(),
      selectedDate: moment(selectedTask.selectedDate).tz("Asia/Seoul").format(),
      toSchedule: selectedTask.toSchedule,
    };

    res.status(200).send(updatedTask);
  } catch (error) {
    console.error("Error toggling toSchedule:", error);
    res.status(500).send(error);
  }
};

exports.toggleSelectedTaskDone = async (req, res) => {
  try {
    const { id } = req.params;
    const selectedTask = await SelectedTask.findById(id);
    if (!selectedTask) {
      return res.status(404).send({ message: "Selected Task not found" });
    }

    // toSchedule 속성 토글
    selectedTask.done = !selectedTask.done;
    await selectedTask.save();

    const updatedTask = {
      ...selectedTask.toObject(),
      dueDate: moment(selectedTask.dueDate).tz("Asia/Seoul").format(),
      selectedDate: moment(selectedTask.selectedDate).tz("Asia/Seoul").format(),
      done: selectedTask.done,
    };

    res.status(200).send(updatedTask);
  } catch (error) {
    console.error("Error toggling toSchedule:", error);
    res.status(500).send(error);
  }
};

exports.updateSelectedTaskFinish = async (req, res) => {
  try {
    const { selectedTask } = req.body;
    const { taskId } = selectedTask;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).send({ message: "Task not found" });
    }

    // Update the selected task's finish property
    selectedTask.finish = true;
    await SelectedTask.findByIdAndUpdate(selectedTask._id, {
      finish: true,
    });

    // Delete selectedTasks with the same taskId and a later selectedDate
    await SelectedTask.deleteMany({
      taskId,
      selectedDate: { $gt: selectedTask.selectedDate },
    });

    switch (task.deleteOption) {
      case "immediate":
        task.done = true;
        await task.save();
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
        break;
      case "keep":
        // No action needed
        break;
      default:
        return res.status(400).send({ message: "Invalid delete option" });
    }

    // Fetch all tasks and selected tasks
    const allTasks = await Task.find();
    const allSelectedTasks = await SelectedTask.find();

    // Format dates
    const formattedTasks = allTasks.map((task) => ({
      ...task.toObject(),
      dueDate: moment(task.dueDate).tz("Asia/Seoul").format(),
    }));

    const formattedSelectedTasks = allSelectedTasks.map((task) => ({
      ...task.toObject(),
      dueDate: moment(task.dueDate).tz("Asia/Seoul").format(),
      selectedDate: moment(task.selectedDate).tz("Asia/Seoul").format(),
    }));

    // Send response with all tasks and selected tasks
    res.status(200).send({
      message: "Task status updated successfully",
      allTasks: formattedTasks,
      allSelectedTasks: formattedSelectedTasks,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
