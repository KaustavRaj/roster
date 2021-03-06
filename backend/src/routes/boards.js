const { verifyAccessToken } = require("../controllers/authController");
const boardsController = require("../controllers/boardsController");
const usersController = require("../controllers/usersController");
const dashboardController = require("../controllers/dashboardController");
const boardsRouter = require("express").Router();

boardsRouter.use(verifyAccessToken);
boardsRouter.get("/", boardsController.getById);
boardsRouter.get("/multiple", boardsController.getMultipleById);
boardsRouter.delete(
  "/",
  boardsController.deleteById,
  dashboardController.deleteStages,
  usersController.boardMultipleUpdatesById
);
boardsRouter.post(
  "/",
  dashboardController.createPredefinedStages,
  boardsController.create,
  usersController.boardMultipleUpdatesById
);
boardsRouter.put("/", boardsController.updateById);

module.exports = boardsRouter;
