const express = require("express");
const router = express.Router();
const {
  addTask,
  addBulkTasks,
  deleteTask,
  getTasksByUserId,
} = require("../controllers/taskController");
const authenticateToken = require("../middleware/authenticate");

// Routes for tasks
router.post("/", authenticateToken, addTask);
router.post("/bulk", authenticateToken, addBulkTasks);
router.delete("/:id", authenticateToken, deleteTask);
router.get("/", authenticateToken, getTasksByUserId); // Removes userId from the path

module.exports = router;
