export function login(state, action) {
  return {
    ...state,
    isAuthenticated: true,
    userData: action.data,
  };
}

export function logout(state, action) {
  return {
    ...state,
    isAuthenticated: false,
  };
}

export function boardAdd(state, action) {}

export function boardDelete(state, action) {}

export function memberAdd(state, action) {}

export function memberDelete(state, action) {}

export function stageRearrange(state, action) {}

export function taskAdd(state, action) {
  const { task_id, title } = action.data;
  // let task = state.tasks[task_id];
  // task.title = title;
  // let newState = { ...state };
  // newState.tasks[task_id] = task;
  // return newState;
  state.tasks[task_id] = {
    id: task_id,
    title: title,
    description: "",
    assigned: [],
  };
  return state;
}

export function taskDelete(state, action) {}

export function taskUpdate(state, action) {
  const {
    task_id,
    title,
    description,
    assigned_id,
    assigned_type,
  } = action.data;
  let task = state.tasks[task_id];
  if (title) task.title = title;
  if (description) task.description = description;
  if (assigned_type) {
    if (assigned_id === "ADD") {
      task.assigned.push(assigned_id);
    } else {
      task.assigned = task.assigned.filter(
        (eachTask) => eachTask.id != task_id
      );
    }
  }

  let newState = { ...state };
  newState.tasks[task_id] = task;
  return newState;
}
