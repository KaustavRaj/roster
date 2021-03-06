const { verifyAccessToken } = require("../controllers/authController");
const dashboardController = require("../controllers/dashboardController");
const taskController = require("../controllers/taskController");
const dashboardRouter = require("express").Router();

/**
 * GET
 * /   :   get all stages (stages will contain all tasks, give board_id)
 *
 *
 * POST
 * /task   :   create a new task (give stage_id and board_id )
 *
 *
 * PUT
 * /       :   update multiple stages (give stage_id and board_id)
 * /task   :   update a task (give stage_id and board_id)
 *
 *
 * DELETE
 * /task   :   delete a task (give stage_id and board_id)
 *
 *
 */

dashboardRouter.use(verifyAccessToken);

// routes for stages
dashboardRouter.get("/", dashboardController.getAllStages);
dashboardRouter.put("/", dashboardController.updateStages);
// dashboardRouter.put("/multiple", dashboardController.updateStages);

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
