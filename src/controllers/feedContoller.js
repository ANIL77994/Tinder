
const ConnectionRequest = require("../models/connectionRequests");
const User = require("../models/users");

const feedApi = async (req, res) => {
    try {
        const loggeruser = req.user
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page-1)*limit
        const connectRequestUser = await ConnectionRequest.find({
            $or: [{ fromUserId: loggeruser._id },
            { toUserId: loggeruser._id }
            ]
        })



        const hiddenUserFromfeed = new Set();

        connectRequestUser.forEach((req) => {
            hiddenUserFromfeed.add(req.fromUserId.toString());
            hiddenUserFromfeed.add(req.toUserId.toString());
        });

        const users = await User.find({
            $and: [
                { _id: { $nin: Array.from({ hiddenUserFromfeed }) } },
                { _id: { $ne: loggeruser._id } }
            ]
        }).select("firstName lastName email photoUrl").skip(skip).limit(limit)

        res.status(200).json({
            message: "get all feed data",
            users
        })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
module.exports = { feedApi }