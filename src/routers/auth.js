const express = require("express")
const {login,signUp, logout} = require("../controllers/auth")
const authRouter = express.Router()

authRouter.post("/login",login)
authRouter.post("/signup",signUp)
authRouter.post("/logout",logout)



module.exports= authRouter