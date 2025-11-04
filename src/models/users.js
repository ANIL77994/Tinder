const express = require("express");
const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");



const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true, // Removes extra spaces
    minlength: [2, "First name must be at least 2 characters"],
    maxlength: [50, "First name cannot exceed 50 characters"],
  },

  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
    minlength: [2, "Last name must be at least 2 characters"],
    maxlength: [50, "Last name cannot exceed 50 characters"],
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true, // Converts to lowercase automatically
    unique: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: "Invalid email format",
    },
  },

  password: {
    type: String,
    required: true,
    trim: true,
  },
  // male:{
  //   type: String,
  //   enum :{
  //     value:["male","female","other"],
  //     message:`{VALUE} is not valid gender type`
  //   }
  // },
  age: {
    type: Number,
    min: [1, "Age must be greater than 0"],
    max: [120, "Age must be less than 120"],
    validate: {
      validator: (value) => Number.isInteger(value),
      message: "Age must be an integer value",
    },
  },

  photoUrl: {
    type: String,
    trim: true,
    default: "",
    validate: {
      validator: (value) =>
        value === "" || validator.isURL(value, { protocols: ["http", "https"], require_protocol: true }),
      message: "Invalid photo URL",
    },
    
  },
},
  {
    timestamps: true,
  });

userSchema.methods.getJWT = function () {
  const user = this;
  

  const token = jwt.sign(
    { _id: user._id },
    "Anildata!@#!",
    { expiresIn: "1h" }
  );

  return token;
};

const User = mongoose.model("User", userSchema)
module.exports = User