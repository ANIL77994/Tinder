const ConnectionRequest = require("../models/connectionRequests");

const userGetDataRecived = async (req, res) => {
    try {
        const requestusres = req.user;

        const connectRequest = await ConnectionRequest.find({
            toUserId: requestusres._id,
            status: "interested"
        }).populate("fromUserId", ["firstName", "lastName", "photoUrl"]);
        if (!connectRequest) {
            return res.status(400).json({ message: "we are not getting all data" });
        }

        const data = connectRequest.map((items)=>
            items.fromUserId
        ) 
        console.log(data)

        res.status(200).json({
            message: "Successfully get the data",
            data,
        });
    } catch (error) {
        res.status(404).json({ message: "not getting data properly" });
    }
};


const usersConnections = async (req, res) => {
    try {
        const loggeruseId = req.user
        const connectionRequest = await ConnectionRequest.find({
            $or: [
                { toUserId: loggeruseId._id, status: "accepted" },
                { fromUserId: loggeruseId._id, status: "accepted" }
            ]
        }).populate("fromUserId","firstName lastName photoUr")
        if (connectionRequest.length == 0) {
            return res.json({ message: "no data availbale in the requests" })
        }
        const data = connectionRequest.map((items)=>
            items.fromUserId
        )
        res.status(200).json({
            message: "Accepted requests retrieved successfully!",
            data
        });
    } catch (error) {
        res.status(404).json({ message: "users not found the accepts data" })
    }
}
module.exports = { userGetDataRecived, usersConnections };
