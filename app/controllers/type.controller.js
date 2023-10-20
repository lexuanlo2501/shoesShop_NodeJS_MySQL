const Types = require("../models/type.model")

exports.get_all_type = (req, res) => {
    Types.get_all((response) => {
        res.send(response)
    })
}

exports.create_type = (req,res) => {
    Types.create(req.body, response => res.status(200).send(response))
}

exports.delete_discount = (req, res) => {
    Types.delete(req.params.id, response => res.status(200).send(response))
}