module.exports = (router) => {
    const accountsController = require("../controllers/accounts.controller")
    router.get("/accounts", accountsController.get_account)
    router.get("/accounts/:id", accountsController.get_account)
    router.post("/signin", accountsController.signIn)
    router.post("/signup", accountsController.create_account)
    router.patch("/accounts/:id", accountsController.update_acc)
    router.patch("/changePassword/:id", accountsController.change_password)
    router.patch("/forgotPassword/:id", accountsController.forgot_password)
    router.patch("/favorite_list/:id", accountsController.favorite_list)
    // router.post("/rating", accountsController.rating_product)









}