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

    case "MEMBER_ADD":
      return methods.memberAdd(state, action);

    case "MEMBER_REMOVE":
      return methods.memberDelete(state, action);

    case "STAGE_REARRANGE":
      return methods.stageRearrange(state, action);

    case "TASK_ADD":
      return methods.taskAdd(state, action);

    case "TASK_UPDATE":
      return methods.taskDelete(state, action);

    case "TASK_DELETE":
      return methods.taskUpdate(state, action);

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
