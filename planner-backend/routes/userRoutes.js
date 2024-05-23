const express = require("express");
const { updateCategory } = require("../controllers/userController");

const router = express.Router();

router.post("/update-category", updateCategory);

module.exports = router;
