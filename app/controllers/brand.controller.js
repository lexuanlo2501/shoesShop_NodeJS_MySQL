const Brands = require("../models/brand.model")

exports.get_all_brand = (req, res) => {
    Brands.get_all((response) => {
        res.send(response)
    })
}

exports.create_brand = (req,res) => {
    Brands.create(req.body, response => res.status(200).send(response))
}

exports.update_brand = (req,res) => {
    Brands.create(req.params.id, req.body, response => res.status(200).send(response))
}

exports.delete_brand = (req, res) => {
    Brands.delete(req.params.id, response => res.status(200).send(response))
}