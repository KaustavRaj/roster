// changes the user data from db records to be sent
// as response
function transformUserData(userData) {
  const { _id, boards, email, name } = userData;
  const storeTokenData = { id: _id, boards, email, name };
  return storeTokenData;
}

// changes the board data from db records to be sent
// as response
function transformBoardData(board) {
  const { _id: id, name, members, stages } = board;
  return { id, name, members, stages };
}

module.exports = { transformUserData, transformBoardData };
