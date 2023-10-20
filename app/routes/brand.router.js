module.exports = (router) => {
    const brandsController = require("../controllers/brand.controller")

    router.get("/brands", brandsController.get_all_brand)
    router.post("/brands", brandsController.create_brand)
    router.delete("/brands/:id", brandsController.delete_brand)

}