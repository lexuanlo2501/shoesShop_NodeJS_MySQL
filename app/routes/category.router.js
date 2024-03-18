module.exports = (router) => {
    const CategoryController = require("../controllers/category.controller")
    router.get("/category", CategoryController.get_all_category)
    router.post("/category", CategoryController.create_category)
    router.delete("/category/:id", CategoryController.delete_category)
    router.patch("/category/:id", CategoryController.update_category)


}