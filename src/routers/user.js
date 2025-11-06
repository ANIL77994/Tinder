const express = require("express")
const userRouters = express.Router()
const {userGetDataRecived,usersConnections} = require("../controllers/userControllers")
const useAuth = require("../middelware/auth")
userRouters.get("/user/requests/recives", useAuth, userGetDataRecived)
userRouters.get("/user/connections",useAuth,usersConnections)

module.exports = userRouters