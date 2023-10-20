module.exports = (router) => {
    const historyController = require("../controllers/history.controller")
    router.get("/history", historyController.get_history)
    router.post("/history", historyController.create_history)

}