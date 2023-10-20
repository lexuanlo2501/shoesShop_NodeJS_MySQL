const { response } = require("express")
const Accounts = require("../models/accounts.model")

exports.get_account = (req, res) => {
    Accounts.get(response => {
        res.send(response)
    }, req.params.id)
}

exports.create_account = (req, res) => {
    Accounts.create(response => {
        res.send(response)

    }, req.body)
}

exports.signIn = (req, res) => {
    Accounts.signIn(req.body, response => {
        res.send(response)
    })
}

exports.update_acc = (req, res) => {
    Accounts.update(req.params.id, req.body, response => {
        res.send(response)
    })
}

exports.change_password = (req, res) => {
    Accounts.changePassword(req.params.id, req.body, response => {
        res.send(response)
    })
}

exports.forgot_password = (req, res) => {
    Accounts.forgotPassword(req.params.id, req.body, response => {
        res.send(response)
    })
}

exports.favorite_list = (req, res) => {
    Accounts.favoriteList(req.params.id, req.body.product_id, response => {
        res.send(response)
    })
}

exports.rating_product = (req, res) => {
    Accounts.rating(req.body, (response) => {
        res.send(response)
    })
}