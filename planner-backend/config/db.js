// const mongoose = require("mongoose");

// exports.connect = () => {
//   mongoose
//     .connect(process.env.MONGO_URL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//     .then(() => console.log("MongoDB Connected"))
//     .catch((err) => console.error(err));
// };

const mongoose = require("mongoose");

exports.connect = () => {
  mongoose
    .connect("mongodb://127.0.0.1:27017/plannerApp", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error(err));
};
