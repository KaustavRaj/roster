const bcrypt = require("bcrypt");
const { Users } = require("../models");
const config = require("../config");
const accessTokenData = require("./common");
const mongoose = require("../mongoose");

function validateQuery(req, res, callback) {
  const { id } = req.query;
  if (!id) {
    res
      .status(400)
      .json({ success: false, error: "No user id found in query" });
  } else {
    callback(mongoose.Types.ObjectId(id));
  }
}

async function getUserById(req, res, next) {
  const onSuccess = (user_id) => {
    Users.findById(user_id, (error, user) => {
      if (error) {
        return res.status(400).json({ success: false, error: error });
      } else {
        return res
          .status(200)
          .json({ success: true, data: accessTokenData(user) });
      }
    });
  };

  validateQuery(req, res, onSuccess);
}

// update line 51
async function getMultipleUsersById(req, res, next) {
  const { userIds } = req.query;

  if (!userIds) {
    return res.status(400).json({ success: false, error: "No ids found" });
  }

  res.locals.usersData = [];
  userIds.forEach((user_id, index) => {
    Users.findById(user_id, (error, user) => {
      if (error) {
        console.log("multiple user data retrieval", error);
        // return res.status(400).json({ success: false, error: error });
      } else {
        res.locals.usersData.push(accessTokenData(user));

        if (index == userIds.length - 1) {
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

// ------------------>  WRONG FUNCTION <------------------------
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

// make this function use updateUserById()
async function boardMultipleUpdatesById(req, res, next) {
  const { id: board_id, members: memberIds } = res.locals.board;
  const type = res.locals.operationType;
  let errorIds = []; // stores members IDs which issued an error in updation
  let updatedMembers = []; // stores updated users data

  console.log("################################");
  console.log("number of members to update", memberIds.length);

  memberIds.map((memberId) => {
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
        console.log("################################");
        console.log(
          "updated memberId",
          memberId,
          "countUsersUpdated",
          countUsersUpdated
        );

        if (error) {
          errorIds.push(memberId);
          console.log("################################");
          console.log("error occurred for", memberId);
        } else {
          const { _id: id, name } = updatedUser;
          updatedMembers.push({ id, name });
        }

        if (countUsersUpdated === memberIds.length) {
          console.log("################################");
          console.log("completed all user updates");
          console.log("error ids", errorIds);

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
  // check if fullname & email & password is sent
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

async function getUserByName(req, res, next) {
  const { q } = req.query;
  if (!q)
    return res.status(400).json({ success: false, error: "no query found" });
  if (q.length == 0) return res.status(200).json({ success: true, data: [] });

  let regexp = new RegExp("^" + q);
  Users.find(
    // { $text: { $search: `${q}*` } },
    { name: { $regex: regexp, $options: "i" } },
    null,
    { limit: config.user_search.max_entries },
    (error, foundUsers) => {
      if (error) return res.status(400).json({ success: false, error: error });
      return res.status(200).json({
        success: true,
        data: foundUsers.map((user) => accessTokenData(user)),
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
