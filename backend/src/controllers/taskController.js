const mongoose = require("../mongoose");
const { Tasks, Users } = require("../models");

function validateQuery(req, res, callback) {
  console.log("QUERY :", req.query);
  const { task_id } = req.query;
  try {
    let converted_task_id = mongoose.Types.ObjectId(task_id);
    return callback(mongoose.Types.ObjectId(converted_task_id));
  } catch (e) {
    return res
      .status(400)
      .json({ success: false, error: "Wrong task_id sent in query" });
  }
}

async function getTaskUtil(task_id, callback) {
  Tasks.findById(task_id, (error, task) => {
    if (error || !task) {
      return callback(null, error);
    }

    console.log("TASK ID", task_id, "TASK DATA", task, "ERROR", error);
    const data = {
      id: task._id,
      description: task.description,
      title: task.title,
      assigned: task.assigned,
    };

    if (task.assigned.length == 0) {
      return callback(data);
    } else {
      let assigned_user_details = [];
      let remaining_search = task.assigned.length;

      task.assigned.map((user_id) => {
        Users.findById(mongoose.Types.ObjectId(user_id), (error, user) => {
          remaining_search -= 1;

          if (!error) {
            let { _id: id, name } = user;
            assigned_user_details.push({ id, name });
          } else {
            console.error(
              `didn't find user_id ${id} when quering assigned for task_id ${task._id}`
            );
          }

          if (remaining_search === 0) {
            data.assigned = assigned_user_details;
            console.log("----------------------------------------------");
            console.log("TASK DATA");
            console.log(data);
            console.log("----------------------------------------------");
            return callback(data);
          }
        });
      });
    }
  });
}

function getTaskById(req, res, next) {
  const onSuccess = async (task_id) => {
    getTaskUtil(task_id, (data, error) => {
      if (error) {
        return res
          .status(404)
          .json({ success: false, error: "didn't find task" });
      }
      return res.status(200).json({ success: true, data: data });
    });
  };

  validateQuery(req, res, onSuccess);
}

async function deleteTaskUtil(task_id, callback) {
  await Tasks.findByIdAndDelete(task_id, (error, deletedTask) => {
    callback(deletedTask, error);
  });
}

async function deleteTaskMultiple(task_ids, callback) {
  let remainingDeletion = task_ids.length;
  task_ids.map((task_id) => {
    deleteTaskUtil(task_id, (deletedTask, error) => {
      remainingDeletion -= 1;
      if (error) console.error("Task couldn't be deleted with id :", task_id);
      if (remainingDeletion === 0) callback();
    });
  });
}

async function deleteTaskById(req, res, next) {
  const { task_id } = req.body;

  console.log("REQ BODY IN DELETE TASK", req.body);

  if (!task_id) {
    return res.status(400).json({ success: false, error: "no task_id found" });
  }

  deleteTaskUtil(task_id, (deletedTask, error) => {
    console.log("DELETED TASK");
    if (error) res.status(400).json({ success: false, error: error });
    res.locals = req.body;
    res.locals.operationType = "DELETE_TASK";

    console.log("RES LOCALS NEW", res.locals);
    next();
  });
}

// title, stage_id
async function createTask(req, res, next) {
  const { title, position } = req.body;
  const newTask = { title: title };

  if (position == null)
    return res
      .status(400)
      .json({ success: false, error: "position not found in payload" });

  await Tasks.create(newTask, (error, createdTask) => {
    if (error) {
      return res.status(500).json({ success: false, error: error });
    }
    res.locals = req.body;
    res.locals.operationType = "ADD_TASK";
    res.locals.task = createdTask;
    next();
  });
}

async function updateTaskById(req, res, next) {
  const { task_id, title, description, assigned_id, assignedType } = req.body;
  let toUpdate = {};

  if (title) {
    toUpdate.title = title;
  }

  if (description) {
    toUpdate.description = description;
  }

  if (assigned_id) {
    if (!assignedType) {
      res
        .status(400)
        .json({ success: false, error: "assignedType not found in query" });
    }

    if (assignedType === "ADD") {
      toUpdate["$push"] = { assigned: assigned_id };
    } else if (assignedType === "DELETE") {
      toUpdate["$pull"] = { assigned: assigned_id };
    } else {
      res.status(400).json({ success: false, error: "wrong assignedType" });
    }
  }

  Tasks.findByIdAndUpdate(task_id, toUpdate, (error) => {
    if (error) {
      res.status(400).json({ success: false, error: error });
    }
    return res.status(201).json({ success: true });
  });
}

module.exports = {
  getTask: getTaskById,
  deleteTask: deleteTaskById,
  createTask: createTask,
  updateTask: updateTaskById,
  getTaskUtil,
  deleteTaskMultiple,
};
