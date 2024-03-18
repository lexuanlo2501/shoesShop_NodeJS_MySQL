module.exports = (router) => {
    const commentController = require("../controllers/comments.controller")
    router.get("/comments", commentController.get_comments)
    router.post("/comments", commentController.submit_comments)
    router.delete("/comments/:id", commentController.remove_comments)
    router.patch("/comments/:id",)
}