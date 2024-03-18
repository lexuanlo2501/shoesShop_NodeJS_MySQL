const SizeTypes = require("../models/sizesType.model")

exports.get_all_sizeTypes = (req, res) => {
    SizeTypes.get_all((response) => {
        res.send(response)
    })
}