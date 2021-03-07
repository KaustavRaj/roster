export function login(state, action) {
  const { userData } = action;
  return {
    ...state,
    isAuthenticated: true,
    userData: userData,
  };
}

export function logout(state, action) {
  return {
    ...state,
    isAuthenticated: false,
  };
}

export function boardAdd(state, action) {
  const { board_id } = action;
  state.userData.boards.push(board_id);
  return state;
}

export function boardDelete(state, action) {
  const { board_id } = action;
  let remaining_board_ids = state.userData.boards.filter(
    (id) => id !== board_id
  );
  state.userData.boards = remaining_board_ids;
  return state;
}
