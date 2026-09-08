const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    if (process.env.NODE_ENV === "test") {
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("connect the DB");   
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
    }
};

module.exports = connectDB;

