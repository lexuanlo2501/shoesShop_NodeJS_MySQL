const Comments = require("../models/comments.model")

exports.get_comments = (req, res) => {
    Comments.getAll(req.query, response => res.status(200).send(response))
}

exports.submit_comments = (req, res) => {
    Comments.submit(req.body, response => res.status(200).send(response))
}

exports.remove_comments = (req, res) => {
    Comments.remove(req.params.id, response => res.status(200).send(response))
}

exports.update_comments = (req, res) => {
    Comments.update(req.params.id, req.body, response => res.status(200).send(response))
}

exports.check_permit = (req, res) => {
    Comments.checkPermit(req.body, response => res.status(200).send(response))
}