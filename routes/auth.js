import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import axios from "axios";
import jwt from "jsonwebtoken";

const router = express.Router();
/* User Registration */
router.post("/signup", async (req, res) => {
  try {
    /* Create a new user */
    const user = await User.findOne({
      email: req.body.email,
    });
    if (user) {
      return res.status(404).json("Email Already Exist");
    } else {
      if (req.body.password === "") {
        const newuser = await new User({
          username: req.body.username,
          email: req.body.email,
          isBrand: req.body.isBrand,
          photo: req.body.photo,
          password: req.body.password,
          country: req.body.country,
        });
        /* Save User and Return and Jwt */
        const userdata = await newuser.save();

        res.status(200).json(userdata);
      } else {
        /* Salting and Hashing the Password */
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);
        const newuser = await new User({
          username: req.body.username,
          email: req.body.email,
          isBrand: req.body.isBrand,
          password: hashedPass,
          country: req.body.country,
        });
        const userdata = await newuser.save();
        /* Save User and Return and Jwt */
        return res.status(200).json(userdata);
      }
    }
  } catch (err) {
    console.log(err);
  }
});

/* User Login */
router.post("/signin", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user) {
      return res.status(404).json("User not found");
    } else {
      if (req.body.password !== "") {
        const validPass = await bcrypt.compare(
          req.body.password,
          user.password
        );
        console.log(validPass, "va");
        if (!validPass) {
          return res.status(400).json("Wrong Password");
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: 60 * 60 * 5,
        });
        return res.status(200).json({
          token,
          user,
        });
      } else {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: 60 * 60 * 5,
        });
        return res.status(200).json({
          token,
          user,
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/checkbot", async (req, res) => {
  try {
    const { YOUR_PRIVATE_KEY, captchaToken } = req.body;

    // Call Google's API to get score
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${YOUR_PRIVATE_KEY}&response=${captchaToken}`
    );

    // Extract result from the API response
    res.status(200).json(response.data);
  } catch (err) {
    console.log(err);
  }
});
router.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.json(false);
    const user = await User.findById(verified.id);
    if (!user) return res.json(false);
    return res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
export default router;
