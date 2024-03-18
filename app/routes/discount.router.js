module.exports = (router) => {
    const discountController = require("../controllers/discount.controller")
    router.get("/discounts", discountController.get_all_Discount)
    router.post("/discounts", discountController.create_discount)
    router.delete("/discounts/:id", discountController.delete_discount)

}