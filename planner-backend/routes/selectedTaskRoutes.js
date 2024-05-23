const express = require("express");
const router = express.Router();
const {
  getSelectedTasksByUserId,
  addSelectedTask,
  deleteSelectedTask,
  toggleSelectedTask,
  toggleSelectedTaskDone,
  updateSelectedTaskFinish,
} = require("../controllers/selectedTaskController");
const authenticateToken = require("../middleware/authenticate");

// User ID is now derived from the token in the controller, not passed in URL
router.get("/", authenticateToken, getSelectedTasksByUserId);
router.post("/", authenticateToken, addSelectedTask);
router.delete("/:id", authenticateToken, deleteSelectedTask);
router.patch("/toggle/:id", authenticateToken, toggleSelectedTask);
router.patch("/toggle/done/:id", authenticateToken, toggleSelectedTaskDone);
router.patch("/finish", authenticateToken, updateSelectedTaskFinish);

module.exports = router;
