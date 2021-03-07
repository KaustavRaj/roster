/*

Structure of global state :

{
  isAuthenticated : bool,

  userData = {
    id : string,
    name: string,
    email : string,
    boards : [string]
  }
}

*/

const initialState = {
  isAuthenticated: false,
  userData: {},
};

export default initialState;
