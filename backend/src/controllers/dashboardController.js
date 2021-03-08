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

        if (stageData.tasks.length === tasks.length) {
          callback(stageData);
        }
      });
    });
  });
}

// rearranges the stages according to the position of predefined
// stage names in config file

function rearrangeStages(stages) {
  const predefinedStageNames = config.predefined_stages.names;
  let rearrangedStages = [];
  predefinedStageNames.map((name) => {
    rearrangedStages.push(
      stages.filter((eachStage) => eachStage.name === name)[0]
    );
  });
  return rearrangedStages;
}

// checks whether a user is authorized to access the dashboard

async function verifyAccessToDashboard(req, res, next) {
  let board_id = String(res.locals.board_id);

  req.query.userIds = [res.locals.decodedTokenData.id];

  usersController.getMultipleById(req, res, () => {
    let [user] = res.locals.usersData;
    let boards_list = user == null ? [] : user.boards.map((id) => String(id));

    let index = boards_list.indexOf(board_id);

    if (index == -1) {
      return res
        .status(404)
        .json({ success: false, error: "board doesn't exist" });
    }
    next();
  });
}

// returns all the stages along with tasks data corresponding
// to a board id; returns error message if failed to fetch stage/task

async function getAllStages(req, res, next) {
  req.query.board_id = res.locals.board_id;

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

          return res.status(200).json({ success: true, data: data });
        }
      });
    });
  });
}

// updates and returns a single stage according to the operation
// type : ADD_TASK, DELETE_TASK, REARRANGE TASKS (when drag and
// drop of task occurs in the same stage itself)

async function updateStage(req, res, next) {
  const {
    operationType,
    task_id,
    stage_id,
    taskIds,
    task,
    position,
  } = res.locals;

  switch (operationType) {
    case "ADD_TASK": {
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
      Stages.findById(stage_id, (error, foundStage) => {
        if (error) {
          return res
            .status(500)
            .json({ success: false, error: "Couldn't find stage" });
        }

        let updatedTasks = foundStage.tasks;

        updatedTasks = updatedTasks
          .filter((eachTask) => String(eachTask.id) !== task_id)
          .map((eachTask, index) => {
            eachTask.position = index;
            return eachTask;
          });

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

            return res.status(201).json({ success: true, data: updatedStage });
          }
        );
      });
      break;
    }

    case "REARRANGE_TASKS": {
      Stages.findByIdAndUpdate(stage_id, { tasks: taskIds }, (error) => {
        if (error)
          return res.status(400).json({ success: false, error: error });
        return res.status(200).json({ success: true });
      });
      break;
    }

    default: {
      return res
        .status(400)
        .json({ success: false, error: "Incorrect operationType" });
    }
  }
}

// updates multiple stages when drag and drop occurs of task
// occurs across stages

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
        res.locals.board = req.body.data;
        res.locals.board.stages = createdStageIds;

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

// called when the entire board needs to be deleted; deletes
// all corresponding stages associated to the board id

async function deleteStages(req, res, next) {
  const stageIds = res.locals.board.stages;

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
        console.log("deleted all stages...");
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
