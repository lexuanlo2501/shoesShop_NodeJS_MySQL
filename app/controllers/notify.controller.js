const Notify = require("../models/notify.model")

exports.get_all_type = (req, res) => {
    const {_accName} = req.query

    const accName = req.session.accName;
    console.log(accName)

    Notify.getAll(response => {
        res.send(response)
    }, _accName)
}

exports.create_notify = (req, res) => {

    Notify.create(response => {
        res.send(response)
    }, req.body)
}

exports.delete_notify = (req, res) => {

    Notify.delete(response => {
        res.send(response)
    }, req.params.id)
}