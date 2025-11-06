const  express = require("express");
const useAuth = require("../middelware/auth");
const {feedApi} = require("../controllers/feedContoller")
const feedRouters = express.Router()

feedRouters.get("/feed",useAuth,feedApi)
module.exports = feedRouters