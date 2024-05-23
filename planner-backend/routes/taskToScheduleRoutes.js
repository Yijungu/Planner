const express = require("express");
const router = express.Router();
const {
  addTaskToSchedule,
  deleteTaskToSchedule,
  getTaskToScheduleByUserId,
} = require("../controllers/taskToScheduleController");
const authenticateToken = require("../middleware/authenticate");

// Routes for task to schedule mappings
router.post("/", authenticateToken, addTaskToSchedule);
router.delete("/:id", authenticateToken, deleteTaskToSchedule);
router.get("/", authenticateToken, getTaskToScheduleByUserId); // Removes userId from the path

module.exports = router;
