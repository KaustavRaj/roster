const mongoose = require("../mongoose");
const { Stages } = require("../models");
const boardsController = require("./boardsController");
const taskController = require("./taskController");
const usersController = require("./usersController");
const config = require("../config");

async function getAllTasksInStage(stage_id, callback) {
  stage_id = mongoose.Types.ObjectId(stage_id);

  Stages.findById(stage_id, (error, stage) => {
    if (error) {
      return callback(null, error);
    }

    const { _id, name, tasks } = stage;
    const stageData = { id: _id, name, tasks: [] };

    if (!tasks || tasks.length == 0) {
      return callback(stageData);
    }

    tasks.map((eachTask) => {
      let task_id = mongoose.Types.ObjectId(eachTask.id);

      taskController.getTaskUtil(task_id, (task, error) => {
        if (error || !task) {
          return callback(null, error || "error");
        }

        const taskData = {
          id: task.id,
          title: task.title,
          position: eachTask.position,
        };
        stageData.tasks.push(taskData);
        console.log("#########################");
        console.log("taskData", taskData);

        if (stageData.tasks.length === tasks.length) {
          callback(stageData);
        }
      });
    });
  });
}

// rearranges the stages according to config.predefined_stages
function rearrangeStages(stages) {
  console.log("STAGES", stages);
  const predefinedStageNames = config.predefined_stages.names;
  let rearrangedStages = [];
  predefinedStageNames.map((name) => {
    rearrangedStages.push(
      stages.filter((eachStage) => eachStage.name === name)[0]
    );
  });
  return rearrangedStages;
}

async function verifyAccessToDashboard(req, res, next) {
  console.log("RES LOCALS IN ASYNC", res.locals);
  let board_id = String(res.locals.board_id);
  console.log("verifyAccessToDashboard board_id", board_id);
  req.query.userIds = [res.locals.decodedTokenData.id];

  usersController.getMultipleById(req, res, () => {
    let [user] = res.locals.usersData;
    let boards_list = user == null ? [] : user.boards.map((id) => String(id));

    console.log("verifyAccessToDashboard board_list", boards_list);

    let index = boards_list.indexOf(board_id);

    console.log("verifyAccessToDashboard index", index);

    if (index == -1) {
      return res
        .status(404)
        .json({ success: false, error: "board doesn't exist" });
    }
    next();
  });
}

async function getAllStages(req, res, next) {
  req.query.board_id = res.locals.board_id;
  console.log("DECODED TOKEN DATA", res.locals.decodedTokenData);

  boardsController.getById(req, res, () => {
    const board = res.locals.board;
    if (board == null) {
      return res
        .status(404)
        .json({ success: false, error: "board doesn't exist" });
    }
    const stageIds = board.stages;
    const data = { id: board._id, name: board.name, stages: [] };

    if (stageIds.length == 0) {
      return res.status(200).json({ success: true, data: data });
    }

    stageIds.map(async (stage_id) => {
      await getAllTasksInStage(stage_id, (stageData, error) => {
        if (error) {
          return res.status(400).json({ success: false, error: error });
        }

        data.stages.push(stageData);
        if (data.stages.length == stageIds.length) {
          data.stages = rearrangeStages(data.stages);
          console.log("#########################");
          console.log("data for stages", data);
          return res.status(200).json({ success: true, data: data });
        }
      });
    });
  });
}

/**
 * operationType => "ADD_TASK", "DELETE_TASK", "REARRANGE_TASKS"
 */
async function updateStage(req, res, next) {
  const {
    operationType,
    task_id,
    stage_id,
    taskIds,
    task,
    position,
  } = res.locals;
  console.log("res.locals", res.locals);

  switch (operationType) {
    case "ADD_TASK": {
      console.log("ADDING TASK....");
      let task_id = task._id;
      Stages.findByIdAndUpdate(
        stage_id,
        { $push: { tasks: { id: task_id, position: position } } },
        (error) => {
          if (error)
            return res.status(400).json({ success: false, error: error });

          const { _id: id, title, assigned } = res.locals.task;
          let taskData = { id, title, assigned };
          return res.status(200).json({ success: true, data: taskData });
        }
      );
      break;
    }

    case "DELETE_TASK": {
      console.log("DELETING TASK.....");
      Stages.findById(stage_id, (error, foundStage) => {
        if (error) {
          return res
            .status(500)
            .json({ success: false, error: "Couldn't find stage" });
        }

        let updatedTasks = foundStage.tasks;
        console.log("OLD TASKS", updatedTasks);

        updatedTasks = updatedTasks
          .filter((eachTask) => String(eachTask.id) !== task_id)
          .map((eachTask, index) => {
            eachTask.position = index;
            return eachTask;
          });

        console.log("UPDATED TASKS", updatedTasks);

        Stages.findByIdAndUpdate(
          stage_id,
          { tasks: updatedTasks },
          (error, updatedStage) => {
            console.log("UPDATED STAGE");

            if (error) {
              return res
                .status(500)
                .json({ success: false, error: "Couldn't update stage" });
            }

            console.log("SENT DATA", updatedStage);

            return res.status(201).json({ success: true, data: updatedStage });
          }
        );
      });
      break;
    }

    case "REARRANGE_TASKS": {
      console.log("REARRANGING....");
      Stages.findByIdAndUpdate(stage_id, { tasks: taskIds }, (error) => {
        if (error)
          return res.status(400).json({ success: false, error: error });
        return res.status(200).json({ success: true });
      });
      break;
    }

    default: {
      console.log("DEFAULT.....");
      return res
        .status(400)
        .json({ success: false, error: "Incorrect operationType" });
    }
  }
}

// make it use updateStage()
async function updateStages(req, res, next) {
  const { stages } = req.body;

  if (!stages)
    return res.status(400).json({ success: false, error: "no stages found" });

  if (!stages.length)
    return res
      .status(400)
      .json({ success: false, error: "empty status array" });

  let remainingUpdates = stages.length;
  stages.map((stage) => {
    let { id: stage_id, tasks } = stage;
    tasks = tasks.map((eachTask) => ({
      id: eachTask.id,
      position: eachTask.position,
    }));

    Stages.findByIdAndUpdate(stage_id, { tasks: tasks }, (error) => {
      remainingUpdates -= 1;
      if (error) return res.status(400).json({ success: false, error: error });
      if (remainingUpdates === 0) {
        return res.status(200).json({ success: true });
      }
    });
  });
}

async function createStage(stage_name, callback) {
  const newStage = { name: stage_name };
  Stages.create(newStage, (error, createdStage) => {
    if (error) {
      return callback(null, error);
    }
    return callback(createdStage._id);
  });
}

async function createPredefinedStages(req, res, next) {
  try {
    var { name, members } = req.body.data;
    if (!name || !members || !members.length) {
      throw new Error();
    }
  } catch (e) {
    return res
      .status(400)
      .json({ success: false, error: "wrong payload sent" });
  }

  const predefinedStageNames = config.predefined_stages.names;
  let createdStageIds = [];

  predefinedStageNames.map((stage_name) => {
    createStage(stage_name, (createdStageId, error) => {
      if (error) {
        return res.status(400).json({ success: false, error: error });
      }
      createdStageIds.push(createdStageId);
      if (createdStageIds.length == predefinedStageNames.length) {
        console.log("################################");
        console.log("res.locals.board", res.locals.board);
        res.locals.board = req.body.data;
        res.locals.board.stages = createdStageIds;
        console.log("################################");
        console.log("created stages");
        console.log("stages list", createdStageIds);
        console.log("after update", res.locals.board);
        next();
      }
    });
  });
}

async function deleteStage(stage_id, callback) {
  Stages.findByIdAndDelete(stage_id, (error, deletedStage) => {
    if (!error) {
      let task_ids_to_delete = deletedStage.tasks.map((task) => task.id);
      taskController.deleteTaskMultiple(task_ids_to_delete, callback);
    }
    callback(error);
  });
}

async function deleteStages(req, res, next) {
  const stageIds = res.locals.board.stages;
  console.log("###################################");
  console.log("delete stageids", stageIds);
  let deletesRemaining = stageIds.length;

  stageIds.map(async (stage_id) => {
    await deleteStage(stage_id, (error) => {
      if (error) {
        return res
          .status(500)
          .json({ success: false, error: "unable to delete stages" });
      }

      deletesRemaining -= 1;
      if (deletesRemaining === 0) {
        next();
      }
    });
  });
}

module.exports = {
  getAllStages,
  updateStage,
  updateStages,
  deleteStages,
  createPredefinedStages,
  verifyAccessToDashboard,
};
