require("dotenv").config();
const express = require("express");
const app = express();
const api = require("./api/v1/index");
const bodyParser = require("body-parser");
const cors = require("cors");

const mongoose = require("mongoose");
const connection = mongoose.connection;

app.set("port", process.env.port || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const uploadDirectory = require("path").join(__dirname, "/uploads");
console.log("uploadDirectory", uploadDirectory);
app.use(express.static(uploadDirectory));

app.use((req, res, next) => {
  console.log(`request handled at ${new Date()}`);
  next();
});

app.use("/api/v1", api);

app.use((req, res, next) => {
  const err = new Error("404 - Not Found");
  err.status = 404;
  res.status(404).json({ msg: "404 - Not Found", err: err });
});

mongoose.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true });
connection.on("error", (err) => {
  console.error(`connection to MongoDB error : ${err.message}`);
});

connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(app.get("port"), () => {
    console.log(
      `express server linstening on http://localhost:${app.get("port")}`
    );
  });
});
