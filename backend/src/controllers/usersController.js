const bcrypt = require("bcrypt");
const { Users } = require("../models");
const config = require("../config");
const { transformUserData } = require("./common");
const mongoose = require("../mongoose");

// Checks whether a valid user id is passed in query
// if yes, call the callback function after converting
// the id to mongoose ObjectId, otherwise send invalid
// error message

function validateQuery(req, res, callback) {
  try {
    const { id } = req.query;
    if (!id) {
      throw new Error();
    } else {
      callback(mongoose.Types.ObjectId(id));
    }
  } catch (e) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid user id found in query" });
  }
}

// returns the user data corresponding to a user id
// if not such user found / error occured, send error msg

async function getUserById(req, res, next) {
  const onSuccess = (user_id) => {
    Users.findById(user_id, (error, user) => {
      if (error || user == null) {
        return res.status(400).json({ success: false, error: error });
      } else {
        return res
          .status(200)
          .json({ success: true, data: transformUserData(user) });
      }
    });
  };

  validateQuery(req, res, onSuccess);
}

// returns a bulk request of multiple user ids
// if some user id is not found, skip that send the rest

async function getMultipleUsersById(req, res, next) {
  const { userIds } = req.query;

  if (!userIds) {
    return res.status(400).json({ success: false, error: "No user ids found" });
  }

  let errorsCount = 0;
  let allUsersData = [];

  userIds.forEach((user_id) => {
    Users.findById(user_id, (error, user) => {
      if (error) {
        errorsCount += 1;
        console.log("multiple user data retrieval at user id = ", user_id);
      } else {
        allUsersData.push(transformUserData(user));

        if (userIds.length === allUsersData.length + errorsCount) {
          res.locals.usersData = allUsersData;
          next();
        }
      }
    });
  });
}

async function deleteUserById(req, res, next) {
  const onSuccess = (user_id) => {
    Users.findByIdAndDelete(user_id, (error) => {
      if (error) {
        return res.status(400).json({ success: false, error: error });
      } else {
        return res.status(200).json({ success: true });
      }
    });
  };

  validateQuery(req, res, onSuccess);
}

async function updateUserById(req, res, next) {
  const onSuccess = (user_id) => {
    const { data } = req.data;
    Users.findByIdAndUpdate(user_id, data, (error) => {
      if (error) {
        res.status(400).json({ success: false, error: error });
      } else {
        return res.status(200).json({ success: true });
      }
    });
  };

  validateQuery(req, res, onSuccess);
}

// handles multiple user updates, whenever a new board is created
// or deleted, all associated users' boards attribute are updated
// if user is not found skip it; operation type can be :
// 1. "ADD" -> when adding a new board
// 2. "DELETE" -> when a board is deleted

async function boardMultipleUpdatesById(req, res, next) {
  const { id: board_id, members: memberIds } = res.locals.board;
  const type = res.locals.operationType;
  let errorIds = []; // stores members IDs which issued an error in updation
  let updatedMembers = []; // stores updated users data

  memberIds.map(async (memberId) => {
    memberId = mongoose.Types.ObjectId(memberId);
    let toUpdate, options;

    if (type === "ADD") {
      toUpdate = { $push: { boards: board_id } };
      options = { new: true };
    } else if (type === "DELETE") {
      toUpdate = { $pull: { boards: board_id } };
      options = {};
    }

    let countUsersUpdated = 0;

    Users.findByIdAndUpdate(
      memberId,
      toUpdate,
      options,
      (error, updatedUser) => {
        countUsersUpdated += 1;

        if (error) {
          errorIds.push(memberId);
        } else {
          const { _id: id, name } = updatedUser;
          updatedMembers.push({ id, name });
        }

        if (countUsersUpdated === memberIds.length) {
          if (type == "DELETE") return res.status(202).json({ success: true });

          res.locals.board.members = updatedMembers;
          return res.status(202).json({
            success: errorIds.length === 0,
            errorIds: errorIds,
            data: res.locals.board,
          });
        }
      }
    );
  });
}

async function registerUser(req, res, next) {
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    return res
      .status(401)
      .json({ success: false, error: "Didn't give correct params" });
  }

  const hashedPassword = bcrypt.hashSync(password, config.bcrypt.salt_rounds);
  const newUser = {
    email: email,
    password: hashedPassword,
    name: name,
  };

  // create user
  Users.create(newUser, (error, createdUser) => {
    if (!error) {
      // created successfully, now return token
      res.locals.user = createdUser;
      next();
    } else {
      // error occured
      return res.status(500).json({ success: false, error: error });
    }
  });
}

// used for autocomplete feature, by full name of users;
// limits query result as given in config file
async function getUserByName(req, res, next) {
  const { q } = req.query;
  if (!q)
    return res.status(400).json({ success: false, error: "no query found" });
  if (q.length == 0) return res.status(200).json({ success: true, data: [] });

  let regexp = new RegExp("^" + q);
  Users.find(
    { name: { $regex: regexp, $options: "i" } },
    null,
    { limit: config.user_search.max_entries },
    (error, foundUsers) => {
      if (error) return res.status(400).json({ success: false, error: error });
      return res.status(200).json({
        success: true,
        data: foundUsers.map((user) => transformUserData(user)),
      });
    }
  );
}

module.exports = {
  getById: getUserById,
  getMultipleById: getMultipleUsersById,
  create: registerUser,
  updateById: updateUserById,
  boardMultipleUpdatesById,
  deleteById: deleteUserById,
  getByName: getUserByName,
};
