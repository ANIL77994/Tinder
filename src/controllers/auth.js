const express = require("express");
const User = require("../models/users");
const bcrypt = require("bcrypt");
const {loginValidator} = require("../utils/validates")

// LOGIN
const login = async (req, res) => {
  try {
    // Validate login data
    loginValidator(req);
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = user.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 3600000,
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// REGISTRATION
const signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password, age, photoUrl } = req.body;

        if (!firstName || !lastName || !email || !password || !age || !photoUrl) {
            return res.status(400).json({ message: "All fields required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error: " + error.message });
    }
};

// LOGOUT
const logout = async (req, res) => {

    res.cookie("token", null, { expires: new Data(Data.now()) })
        .status(200).send({ message: "Logged out successfully" });
};

module.exports = { login, signUp, logout };
