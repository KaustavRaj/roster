const { Boards, Users } = require("../models");
const mongoose = require("../mongoose");
const qs = require("qs");
const { transformBoardData } = require("./common");

// Checks whether a valid board id is passed in query
// if yes, call the callback function after converting
// the id to mongoose ObjectId, otherwise send invalid
// error message

function validateQuery(req, res, callback) {
  const { board_id } = req.query;
  try {
    let converted_board_id = mongoose.Types.ObjectId(board_id);
    return callback(mongoose.Types.ObjectId(converted_board_id));
  } catch (e) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid board_id sent in query" });
  }
}

async function getBoardById(req, res, next) {
  const onSuccess = (board_id) => {
    Boards.findById(board_id, (error, board) => {
      if (error) {
        return res
          .status(404)
          .json({ success: false, error: "no such board exists" });
      } else {
        res.locals.board = board;
        next();
      }
    });
  };

  validateQuery(req, res, onSuccess);
}

// returns all board data of a user along with associated
// members' data; skips the boards not found
async function getMultipleBoardsById(req, res, next) {
  let boardIds;

  try {
    boardIds = JSON.parse(qs.parse(req.query).boardIds);
    if (!boardIds || !boardIds.length) throw new Error();
  } catch (e) {
    return res.status(400).json({ success: false, error: "No ids found" });
  }

  try {
    let boardsData = {};
    let boardsCount = 0;
    let errorInRetrievingCount = 0;

    boardIds.forEach(async (boardId) => {
      Boards.findById(boardId, (error, board) => {
        // if board data not found
        if (error || !board) {
          errorInRetrievingCount += 1;
          boardsCount += 1;

          console.log(`${errorInRetrievingCount} errors in board`);

          if (boardsCount === boardIds.length) {
            let finalData = Object.keys(boardsData).map(
              (board_id) => boardsData[board_id]
            );

            return res.status(200).json({ success: true, data: finalData });
          }
        }

        // board data found
        else {
          const { _id: id, stages, members, name } = board;
          board = { id, stages, members, name };
          boardsData[id] = board;
          let memberIds = board.members;
          let membersData = {};
          let usersCount = 0;

          memberIds.forEach(async (user_id) => {
            Users.findById(user_id, (error, user) => {
              usersCount += 1;
              if (!error || user != null) {
                let { _id: id, name } = user;
                membersData[user_id] = { id, name };
              }

              if (usersCount === memberIds.length) {
                boardsData[id].members = Object.keys(membersData).map(
                  (user_id) => membersData[user_id]
                );
                boardsCount += 1;
              }

              if (boardsCount === boardIds.length) {
                let finalData = Object.keys(boardsData).map(
                  (board_id) => boardsData[board_id]
                );

                return res.status(200).json({ success: true, data: finalData });
              }
            });
          });
        }
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
        console.log(`Deleted board with board_id ${board_id}`);
        res.locals.board = deletedDoard;
        res.locals.operationType = "DELETE";
        next();
      }
    });
  };

  validateQuery(req, res, onSuccess);
}

async function createBoard(req, res, next) {
  Boards.create(res.locals.board, (error, createdBoard) => {
    if (error) {
      return res.status(400).json({ success: false, error: error });
    } else {
      res.locals.board = transformBoardData(createdBoard);
      res.locals.operationType = "ADD";
      next();
    }
  });
}

// updates (both insertion and deletion) the board members
// corresponding to a board id
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
