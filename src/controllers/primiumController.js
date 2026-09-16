const primiumController = async (req, res) => {
    try {
        console.log("hello")
        return res.json({ message: "Primium service" })

    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}

module.exports = { primiumController }