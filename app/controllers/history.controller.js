const History = require("../models/history.model")

exports.get_history = (req, res) => {
    History.get(response => {
        res.send(response)
    })
}

exports.create_history = (req, res) => {
    History.create(req.body, response => {
        res.send(response)
    })
}