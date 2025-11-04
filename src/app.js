const express = require("express");
const app = express();
const connectDB = require("./configs/database");
const {profileRouters} = require("./routers/profile")
const requestConnection = require("./routers/requests")
const cookieParser = require("cookie-parser");

require("dotenv").config();
const authRouter = require("./routers/auth")

const cors = require("cors");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:3000", // your React app URL
  credentials: true,               // allow cookies to be sent
}));

connectDB()
app.use("/",authRouter)
app.use("/",profileRouters)
app.use("/",requestConnection)



const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });