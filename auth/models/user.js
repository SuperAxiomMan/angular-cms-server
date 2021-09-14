const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  createdOn: { type: Date, default: Date.now },
  username: { type: String, required: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);