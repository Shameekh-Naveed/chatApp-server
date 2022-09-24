require("dotenv").config();
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Add someone to the friends list of a specific user
router.post("/addFriend/:id", async (req, res) => {
  let friendId = req.params.id;
  const user_id = jwt.verify(auth_tokken, process.env.REACT_APP_JWT_SECRET);
  let user = await User.findByIdAndUpdate(user_id, {
    friends: [...friends, friendId],
  });
  console.log(user)
});
