require("dotenv").config();
const express = require("express");
const app = express();
const api = require("./api/v1/index");
const auth = require("./auth/routes");
const bodyParser = require("body-parser");
const cors = require("cors");

const mongoose = require("mongoose");
const connection = mongoose.connection;

app.set("port", process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

//Passport Config
const passport = require("passport");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const Strategy = require("passport-local").Strategy;
const User = require("./auth/models/user");

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    name: "angular-cms",
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

passport.use(
  new Strategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    (name, pwd, cb) => {
      User.findOne({ username: name }, (err, user) => {
        if (err) {
          console.error("error while login : ", err);
          return cb(null, false);
        }
        if (user == null) {
          console.error(`${name} not present in the DB`);
          return cb(null, false);
        }
        if (user.password !== pwd) {
          console.error(`wrong password for ${name}`);
          cb(null, false);
        } else {
          console.error(`${name} found in MongoDB and authenticated`);
          cb(null, user);
        }
      });
    }
  )
);

//PassPort Config END

const uploadDirectory = require("path").join(__dirname, "/uploads");
console.log("uploadDirectory", uploadDirectory);
app.use(express.static(uploadDirectory));

app.use((req, res, next) => {
  console.log(`request handled at ${new Date()}`);
  next();
});

app.use("/api/v1", api);
app.use("/auth", auth);

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
