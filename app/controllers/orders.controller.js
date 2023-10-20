const Orders = require("../models/orders.model")

exports.get_orders = (req, res) => {
    const {_client_id, _status} = req.query
    Orders.get(response => {
        res.send(response)
    }, req.params.id, _client_id, _status)
}

exports.create_orders = (req, res) => {
    Orders.create(req.body, response => {
        res.send(response)
    })
}

exports.delete_orders = (req, res) => {
    Orders.delete(req.params.id, response => {
        res.send(response)
    })
}

exports.update_orders = (req, res) => {
    Orders.update(req.params.id, req.body, response => {
        res.send(response)
    })
}

exports.rating_product = (req, res) => {
    Orders.rating(req.body, response => {
        res.send(response)
    })
}

