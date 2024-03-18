const Comments = require("../models/comments.model")

exports.get_comments = (req, res) => {
    const {product_id} = req.query
    Comments.getAll(product_id, response => res.status(200).send(response))
}

exports.submit_comments = (req, res) => {
    Comments.submit(req.body, response => res.status(200).send(response))
}

exports.remove_comments = (req, res) => {
    Comments.remove(req.params.id, response => res.status(200).send(response))
}