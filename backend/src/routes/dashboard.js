const { verifyAccessToken } = require("../controllers/authController");
const dashboardController = require("../controllers/dashboardController");
const taskController = require("../controllers/taskController");
const dashboardRouter = require("express").Router();

dashboardRouter.use(verifyAccessToken);

// routes for stages
dashboardRouter.get(
  "/",
  dashboardController.verifyAccessToDashboard,
  dashboardController.getAllStages
);
dashboardRouter.put("/", dashboardController.updateStages);

// routes for tasks
dashboardRouter.get("/task", taskController.getTask);
dashboardRouter.put("/task", taskController.updateTask);
dashboardRouter.post(
  "/task",
  taskController.createTask,
  dashboardController.updateStage
);
dashboardRouter.delete(
  "/task",
  taskController.deleteTask,
  dashboardController.updateStage
);

module.exports = dashboardRouter;
