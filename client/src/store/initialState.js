/*

Structure of global state :

{
  isAuthenticated : bool,

  userData = {
    id -> string,
    name -> string,
    email -> string,
    boards -> [string]
  },

  boards = {
    id : {
      id -> string,
      name -> string,
      members -> [{id: string}],
      stages -> [stages]
    }
  },

  stages = {
    id : {
      id -> string,
      name -> string,
      tasks -> [{id: string, position: number}]
    }
  },

  tasks = {
    id : {
      id -> string,
      title -> string,
      assigned -> [{id: string}]
    }
  },

  users = {
    id : {
      id -> string,
      name -> string
    }
  }
}

*/

const initialState = {
  isAuthenticated: false,
  userData: {},
  boards: {},
  stages: {},
  tasks: {},
  users: {},
};

export default initialState;
