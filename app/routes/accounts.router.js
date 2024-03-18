const _AuthMiddleWare = require('../common/_AuthMiddleWare')


module.exports = (router) => {
    const accountsController = require("../controllers/accounts.controller")

    // router.get("/accounts", _AuthMiddleWare.isAuth,accountsController.get_account)
    // router.get("/accounts/:id", _AuthMiddleWare.isAunth_AdminUser,accountsController.get_account)
    router.get("/accounts", accountsController.get_account)
    router.get("/accounts/:id", accountsController.get_account)
    
    router.post("/signin",accountsController.signIn)
    router.post("/signup", accountsController.create_account)
    router.post("/logout/:id", _AuthMiddleWare.isAunth_AdminUser, accountsController.userLogOut)
    router.patch("/accounts/:id", _AuthMiddleWare.isAunth_AdminUser,accountsController.update_acc)
    router.patch("/changePassword/:id", accountsController.change_password)
    router.patch("/forgotPassword/:id", accountsController.forgot_password)
    router.patch("/favorite_list/:id", _AuthMiddleWare.isAunth_AdminUser,accountsController.favorite_list)

    router.post('/refreshToken', accountsController.requestRefreshToken)
    router.post('/refreshToken_v2', accountsController.requestRefreshToken_v2)

    router.post("/signin_2", accountsController.signIn_2)

    // router.post("/rating", accountsController.rating_product)









}