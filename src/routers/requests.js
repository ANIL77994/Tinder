const express = require("express")
const requestRouter = express.Router()
const useAuth = require("../middelware/auth")
const {requestConnection,requestAcceptancy} = require("../controllers/requestscontroller")

requestRouter.post("/request/send/:status/:toUserId",useAuth,requestConnection)
requestRouter.post(
  "/request/review/:status/:requestId",
  useAuth,
  requestAcceptancy
);


module.exports= requestRouter