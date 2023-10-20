const { response } = require("express")
const Discounts = require("../models/discount.model")

exports.get_all_Discount = (req, res) => {
    Discounts.get(response => res.status(200).send(response) )
}

exports.create_discount = (req, res) => {
    Discounts.create(req.body, response => res.status(200).send(response))
}

exports.delete_discount = (req, res) => {
    Discounts.delete(req.params.id, response => res.status(200).send(response))
}