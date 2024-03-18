module.exports = (router) => {
    const dashboardController = require("../controllers/dashboard.controller")

    router.get("/dashboard",dashboardController.get_)
   

}