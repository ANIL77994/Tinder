const express =require("express")
const {profile,editProfile} = require("../controllers/profile")
const useAuth = require("../middelware/auth")
 const profileRouters = express.Router() 

 
 profileRouters.get("/profile",useAuth,profile)
 profileRouters.patch("/profile/edit",useAuth,editProfile)

 module.exports = {profileRouters}      