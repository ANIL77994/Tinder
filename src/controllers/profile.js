const User = require("../models/users");
const { profileValidates } = require("../utils/validates")

const profile = async (req, res) => {
  try {

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }

    const user = req.user


    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send user details in response
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error in /profile route:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const editProfile = async (req, res) => {
  try { 


    if (!profileValidates(req.body)) {
      return res.status(400).json({ message: "Not Valid edit api" });
    }
    const loggedInUser = req.user

    Object.keys(req.body).forEach((key) =>
      loggedInUser[key] = req.body[key]
    )
    const data = req.user
    res.status(200).json({ message: data })

  } catch (error) {
    res.status(400).send("ERROR:" + error)
  }

}

module.exports = { profile, editProfile };
