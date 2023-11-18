module.exports = (router) => {
    const notifyController = require("../controllers/notify.controller")

    router.get("/notify", notifyController.get_all_type)
    router.post("/notify", notifyController.create_notify)
    router.patch("/notify/:id", notifyController.update_notify)
    router.delete("/notify/:id", notifyController.delete_notify)


    

}