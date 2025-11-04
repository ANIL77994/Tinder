const mangoose = require("mongoose")
require("dotenv").config();
const connectDB = async () => {
    try {
        await mangoose.connect(process.env.MONGO_URI)
        console.log("connect the DB")   
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);

    }
}

module.exports = connectDB
