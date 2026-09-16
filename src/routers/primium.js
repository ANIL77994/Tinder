const express = require("express")
const useAuth = require("../middelware/auth")
const { primiumController } = require("../controllers/primiumController")


const primiumRouters = express.Router()

primiumRouters.post("/service/premiume", useAuth, primiumController)

module.exports = primiumRouters