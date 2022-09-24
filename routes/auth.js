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
      return res.status(400).json({ status, msg: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        res.status(400).json({ status, msg: "Email already in use" });
      }
      // Convert Password to hash
      const salt = await bcrypt.genSalt(10);
      const securePassword = await bcrypt.hash(req.body.password, salt);
      // Make a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securePassword,
        friends: [],
      });
      //   JWT
      const data = {
        user_id: user.id,
      };
      const auth_tokken = jwt.sign(data, process.env.REACT_APP_JWT_SECRET);
      status = true;
      res.json({ status, auth_tokken, user_id:data.user_id });
    } catch (error) {
      console.log(error.message);
      return res.status(500).send({ status, msg: "Internal server error" });
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
      return res.status(400).json({ status, msg: errors.array() });
    }
    try {
      const { email, password } = req.body;
      // Validate Email
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ status, msg: "Invalid Credentials" });
      }

      //   Validate Password
      const bcryptCompare = await bcrypt.compare(password, user.password);
      if (!bcryptCompare) {
        return res.status(400).json({ status, msg: "Invalid Credentials" });
      }
      const data = {
        user_id: user.id,
      };
      const auth_tokken = jwt.sign(data, process.env.REACT_APP_JWT_SECRET);
      status = true;
      return res.json({ status, auth_tokken, user_id:data.user_id });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ status, msg: "Internal server error" });
    }
  }
);

// Get information about any user
router.post("/getUser", async (req, res) => {
  let status = false;
  try {
    const { query } = req.body;
    console.log(query,"line 102 auth.js");
    if(!query){
      status = true
      return res.status(200).json({ status, msg: "No query recieved" });
    }
    let user;
    user = await User.findOne({ email: query });
    // if (email) {
    // } else if (user_id) {
    // }
    if (!user) user = await User.findById(query);
    if (!user) {
      return res.status(400).json({ status, msg: "User does not exist" });
    }
    status = true;
    return res.json({
      status,
      name: user.name,
      email: user.email,
      id: user._id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status, msg: "Internal server error" });
  }
});

// Get friends of user middleware
const getFriends = async (req, res, next) => {
  let status = false;
  try {
    // Decrypt the tokken
    const { user_id } = jwt.verify(
      req.body.auth_tokken,
      process.env.REACT_APP_JWT_SECRET
    );
    // Find the user and get its friends and then update that array
    let user = await User.findById(user_id);
    req.friends = user.friends;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status, msg: "Internal server error" });
  }
};
// Get friends of user
router.post("/getFriends", async (req, res) => {
  let status = false;
  try {
    // Decrypt the tokken
    const { user_id } = jwt.verify(
      req.body.auth_tokken,
      process.env.REACT_APP_JWT_SECRET
    );
    // Find the user and get its friends and then update that array
    let user = await User.findById(user_id);
    let friends = user.friends;
    status = true;
    return res.status(200).send({ status, friends });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status, msg: "Internal server error" });
  }
});

// Add someone to the friends list of a specific user
router.post("/addFriend/:id", getFriends, async (req, res) => {
  // console.log(req.body)
  let status = false;
  let friendId = req.params.id;
  try {
    // Decrypt the tokken
    const { user_id } = jwt.verify(
      req.body.auth_tokken,
      process.env.REACT_APP_JWT_SECRET
    );
    // // Find the user and get its friends and then updte that array
    // let user = await User.findById(user_id);
    // let friends = user.friends;
    req.friends.push(friendId);
    // Replace with new array
    await User.findByIdAndUpdate(user_id, { friends: req.friends });
    status = true;
    res.status(200).send({ status, msg: "Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status, msg: "Internal server error" });
  }
});

module.exports = router;
