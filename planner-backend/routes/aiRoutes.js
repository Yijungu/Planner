const express = require("express");
const router = express.Router();
const {
  processCommand,
  processAdditionalCommand,
} = require("../controllers/aiController");
const authenticateToken = require("../middleware/authenticate");

router.post("/command", authenticateToken, processCommand);
router.post("/additional-command", authenticateToken, processAdditionalCommand);

module.exports = router;
