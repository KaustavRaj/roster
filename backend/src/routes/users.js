const { verifyAccessToken } = require("../controllers/authController");
const usersRouter = require("express").Router();
const usersController = require("../controllers/usersController");

usersRouter.use(verifyAccessToken);
usersRouter.get("/", usersController.getById);
usersRouter.delete("/", usersController.deleteById);
usersRouter.put("/", usersController.updateById);

// user search
usersRouter.get("/search", usersController.getByName);

module.exports = usersRouter;
