module.exports = (router) => {
    const sizesTypeController = require("../controllers/sizesType.controller")
    router.get("/sizesType", sizesTypeController.get_all_sizeTypes)
 
}