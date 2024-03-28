module.exports = (router) => {
    const commentController = require("../controllers/comments.controller")
    router.get("/comments", commentController.get_comments)
    router.post("/comments", commentController.submit_comments)
    router.delete("/comments/:id", commentController.remove_comments)
    router.patch("/comments/:id", commentController.update_comments)
    router.post("/checkPermitCmt", commentController.check_permit)

    // REPLY
    router.post("/replyComments", commentController.reply_comments)
    router.delete("/replyComments/:id", commentController.remove_reply)

}