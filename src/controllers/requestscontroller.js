const express = require("express");
const ConnectionRequest = require("../models/connectionRequests");
const User = require("../models/users");
const mongoose = require("mongoose");

const requestConnection = async (req, res) => {
    try {
        const validStatuses = ["ignored", "interested"];

        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        // ✅ Validate that 'toUserId' is provided
        if (!toUserId) {
            return res.status(400).json({ message: "Missing 'toUserId' parameter." });
        }

        // ✅ Validate that 'status' is valid
        if (!validStatuses.includes(status)) {
            return res
                .status(400)
                .json({ message: `Invalid status type: ${status}. Allowed: ${validStatuses.join(", ")}` });
        }

        // ✅ Check if same user
        const sameId = fromUserId.toString() === toUserId.toString();
        if (sameId) {
            return res.status(400).json({ message: "You cannot send a connection request to yourself." });
        }

        // ✅ Check if receiver exists
        const receiverUser = await User.findById(toUserId);
        if (!receiverUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // ✅ Check if connection already exists in both directions
        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId },
            ],
        });

        if (existingRequest) {
            return res
                .status(400)
                .json({ message: "Connection request already exists between these users." });
        }

        // ✅ Create new connection request
        const newConnectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        });

        const savedRequest = await newConnectionRequest.save();

        // ✅ Fix: You cannot do `toUserId.firstName` because `toUserId` is just an ID
        res.status(200).json({
            message: `${req.user.firstName} is ${status} in ${receiverUser.firstName}`,
            data: savedRequest,
        });
    } catch (error) {
        console.error("Error in requestConnection:", error);
        res.status(500).json({
            message: "ERROR: " + error.message,
        });
    }
};

const requestAcceptancy = async (req, res) => {
  try {
    const { requestId, status } = req.params;
    const loggedInUserId = req.user._id;  
    console.log(requestId)
    console.log(loggedInUserId)   

 

    // ✅ Step 1: Validate status
    const validStatuses = ["accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be accepted or rejected." });
    }

    // ✅ Step 2: Find request that belongs to this user (Anil)
    const connectionRequestUser = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUserId,
      status: "interested",
    });
    console.log(connectionRequestUser)

    if (!connectionRequestUser) {
      return res.status(404).json({ message: "No pending connection request found for this user." });
    }

    // ✅ Step 3: Update request status
    connectionRequestUser.status = status;
    await connectionRequestUser.save();

   

    // ✅ Step 5: Respond clearly
    return res.status(200).json({
    //   message: `${toUserId.firstName} has ${status} the connection request from ${fromUser.firstName}.`,
      data: connectionRequestUser,
    });

  } catch (error) {
    console.error("❌ Error in requestAcceptancy:", error);
    return res.status(500).json({ message: "Server error: " + error.message });
  }
};






module.exports = { requestConnection, requestAcceptancy };
