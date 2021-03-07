import { useReducer } from "react";
import * as methods from "../store/methods";
import initialState from "../store/initialState";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return methods.login(state, action);

    case "LOGOUT":
      return methods.logout(state, action);

    case "BOARD_ADD":
      return methods.boardAdd(state, action);

    case "BOARD_DELETE":
      return methods.boardDelete(state, action);

    default: {
      return state;
    }
  }
};

const useGlobalState = () => {
  const [globalState, globalDispatch] = useReducer(reducer, initialState);
  return { globalState, globalDispatch };
};

export default useGlobalState;
