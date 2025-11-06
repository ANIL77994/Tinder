const { json } = require("express");
const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: "{VALUE} is an incorrect status type",
      },
      default: "interested",
    },
  },
  { timestamps: true }
);

// connectionRequestSchema.pre("save", function (next) {
//   const connectionRequest = this
//   if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
//     throw new Error("You cannot send a connection request to yourself.")
//   }
// })

connectionRequestSchema.index({fromUserId: 1, toUserId: 1})

const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);

module.exports = ConnectionRequest;
