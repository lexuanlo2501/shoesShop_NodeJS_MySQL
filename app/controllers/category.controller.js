const { response } = require("express")
const Category = require("../models/category.model")

exports.get_all_category = (req, res) => {
    Category.get_all((response) => {
        res.send(response)
    })
}

exports.create_category = (req,res) => {
    Category.create(req.body, response => res.status(200).send(response))
}

exports.update_category = (req, res) => {
    Category.update(req.params.id,req.body, response => res.status(200).send(response))
}

exports.delete_category = (req, res) => {
    Category.delete(req.params.id, response => res.status(200).send(response))
}
