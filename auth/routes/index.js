const express = require("express");
const passport = require("passport");
const router = express.Router();
const userModel = require("../models/user");

router.post("/register", (req, res) => {
  console.log("user>>>", req.body);
  const newUser = new userModel(req.body);
  newUser.save((err, user) => {
    if (err) return res.status(500).json(err);
    req.login(req.body, (err) => {
      if (err) console.log("error during the registration : req.logIn()", err);
      res.status(201).json(user);
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/auth/success",
    failureRedirect: "/auth/failure",
  })
);

router.get("/success", (req, res) => {
  res.status(200).json({ msg: "logged in", user: req.user });
});

router.get("/failure", (req, res) => {
  res.status(401).json({ msg: "not logged in!!", user: req.user });
});

module.exports = router;
