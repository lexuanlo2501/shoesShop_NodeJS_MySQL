module.exports = (router) => {
    const typesController = require("../controllers/type.controller")
    router.get("/types", typesController.get_all_type)
    router.post("/types", typesController.create_type)
    router.delete("/types/:id", typesController.delete_discount)

}