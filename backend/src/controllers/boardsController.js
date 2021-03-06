const { Boards } = require("../models");
const usersController = require("./usersController");
const mongoose = require("../mongoose");
const qs = require("qs");

function validateQuery(req, res, callback) {
  const { board_id } = req.query;
  if (!board_id) {
    return res
      .status(400)
      .json({ success: false, error: "No board_id found in query" });
  } else {
    callback(mongoose.Types.ObjectId(board_id));
  }
}

async function getBoardById(req, res, next) {
  const onSuccess = (board_id) => {
    Boards.findById(board_id, (error, board) => {
      if (error) {
        return res.status(400).json({ success: false, error: error });
      } else {
        // res.status(200).json({ success: true, data: board });
        res.locals.board = board;
        next();
      }
    });
  };

  validateQuery(req, res, onSuccess);
}

async function getMultipleBoardsById(req, res, next) {
  let boardIds;

  try {
    boardIds = JSON.parse(qs.parse(req.query).boardIds);
    console.log("###################################");
    console.log("boardIds", boardIds);
    if (!boardIds || !boardIds.length) throw new Error();
  } catch (e) {
    return res.status(400).json({ success: false, error: "No ids found" });
  }

  try {
    res.locals.boards = [];
    boardIds.forEach((boardId) => {
      req.query.board_id = boardId;

      getBoardById(req, res, async () => {
        if (!res.locals.board) {
          return res
            .status(200)
            .json({ success: true, data: res.locals.boards });
        }

        const { _id: id, lists, members, name } = res.locals.board;
        const boardData = { id, lists, members, name };
        req.query.userIds = boardData.members;

        usersController.getMultipleById(req, res, () => {
          boardData.members = res.locals.usersData.map((user) => {
            const { boards, ...rest } = user;
            return rest;
          });

          res.locals.boards.push(boardData);

          if (res.locals.boards.length == boardIds.length) {
            return res
              .status(200)
              .json({ success: true, data: res.locals.boards });
          }
        });
      });
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false });
  }
}

async function deleteBoardById(req, res, next) {
  const onSuccess = (board_id) => {
    Boards.findByIdAndDelete(board_id, (error, deletedDoard) => {
      if (error) {
        return res.status(400).json({ success: false, error: error });
      } else {
        res.locals.board = deletedDoard;
        res.locals.operationType = "DELETE";
        next();
      }
    });
  };

  validateQuery(req, res, onSuccess);
}

function transformBoardData(board) {
  const { _id: id, name, members, stages } = board;
  return { id, name, members, stages };
}

async function createBoard(req, res, next) {
  console.log("################################");
  console.log("creating board...");
  Boards.create(res.locals.board, (error, createdBoard) => {
    if (error) {
      return res.status(400).json({ success: false, error: error });
    } else {
      console.log("################################");
      console.log("created board");
      console.log("board data", createdBoard);
      res.locals.board = transformBoardData(createdBoard);
      res.locals.operationType = "ADD";
      console.log("################################");
      console.log("after transformBoardData");
      console.log("res.locals", res.locals);
      next();
    }
  });
}

async function updateMembers(req, res, next) {
  let { board_id, members } = req.body;

  if (!board_id || !members || !members.length) {
    return res.status(400).json({ success: false, error: "wrong params sent" });
  }

  try {
    members = members.map((member_id) => mongoose.Types.ObjectId(member_id));
    Boards.findByIdAndUpdate(
      board_id,
      { members: members },
      (error, updatedBoard) => {
        if (error) res.status(500).json({ success: false });

        let { _id: id, members, name, stages } = updatedBoard;
        return res
          .status(201)
          .json({ success: true, data: { id, members, name, stages } });
      }
    );
  } catch (e) {
    return res.status(400).json({ success: false, error: "error in payload" });
  }
}

module.exports = {
  getById: getBoardById,
  getMultipleById: getMultipleBoardsById,
  create: createBoard,
  deleteById: deleteBoardById,
  updateById: updateMembers,
};
