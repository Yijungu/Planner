const express = require("express");
const router = express.Router();
const {
  authenticateKakao,
  refreshToken,
} = require("../controllers/authController");

router.post("/kakao", authenticateKakao);
router.post("/refresh", refreshToken);

module.exports = router;
