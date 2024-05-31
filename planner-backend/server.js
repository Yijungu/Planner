require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./config/db");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const taskRoutes = require("./routes/taskRoutes");
const taskToScheduleRoutes = require("./routes/taskToScheduleRoutes");
const selectedTaskRoutes = require("./routes/selectedTaskRoutes");
const userRoutes = require("./routes/userRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));

db.connect();

app.use("/auth", authRoutes);
app.use("/schedules", scheduleRoutes);
app.use("/tasks", taskRoutes);
app.use("/taskstoschedules", taskToScheduleRoutes);
app.use("/selectedtasks", selectedTaskRoutes);
app.use("/user", userRoutes);
app.use("/ai", aiRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
