require("dotenv").config();
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Creating user using POST. Login not required
router.post(
  "/signup",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email address").isEmail(),
    body(
      "password",
      "Password must be atleast 5 characters and include both letters and numbers"
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let status = false;
    if (!errors.isEmpty()) {
      return res.status(400).json({ status, errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        res.status(400).json({ status, errors: "Email already in use" });
      }
      // Convert Password to hash
      const salt = await bcrypt.genSalt(10);
      const securePassword = await bcrypt.hash(req.body.password, salt);
      // Make a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securePassword,
      });
      //   JWT
      const data = {
        user_id: user.id,
      };
      const auth_tokken = jwt.sign(data, process.env.REACT_APP_JWT_SECRET);
      status = true;
      res.json({ status, auth_tokken });
    } catch (error) {
      console.log(error.message);
      return res.status(500).send({ status, msg: "Internal server erro" });
    }
  }
);

// Authenticating a user for logging in
router.post(
  "/login",
  [
    body("email", "Invalid Email").isEmail(),
    body("password", "Password can not be blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let status = false;
    if (!errors.isEmpty()) {
      return res.status(400).json({ status, errors: errors.array() });
    }
    try {
      const { email, password } = req.body;
      // Validate Email
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ status, error: "Invalid Credentials" });
      }

      //   Validate Password
      const bcryptCompare = await bcrypt.compare(password, user.password);
      if (!bcryptCompare) {
        return res.status(400).json({ status, error: "Invalid Credentials" });
      }
      const data = {
        user_id: user.id,
      };
      const auth_tokken = jwt.sign(data, process.env.REACT_APP_JWT_SECRET);
      status = true;
      return res.json({ status, auth_tokken });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ status, msg: "Internal server erro" });
    }
  }
);

module.exports = router;
