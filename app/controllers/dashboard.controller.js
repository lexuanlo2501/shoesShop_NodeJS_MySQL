const Dashboard = require("../models/dashboard.model")

exports.get_ = (req, res) => {
    Dashboard.get(req.query,(response) => {
        res.send(response)
    })
}

