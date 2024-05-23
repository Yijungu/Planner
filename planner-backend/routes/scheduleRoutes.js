const express = require("express");
const router = express.Router();
const {
  addSchedule,
  addBulkSchedules,
  deleteSchedule,
  getSchedulesByUserId,
} = require("../controllers/scheduleController");
const authenticateToken = require("../middleware/authenticate");

// Routes for schedules
router.post("/", authenticateToken, addSchedule);
router.post("/bulk", authenticateToken, addBulkSchedules);
router.delete("/:id", authenticateToken, deleteSchedule);
router.get("/", authenticateToken, getSchedulesByUserId);

module.exports = router;
