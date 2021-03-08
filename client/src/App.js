import React, { useEffect, useContext, useState } from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import axios from "axios";
import { Boards, Login, Signup, Dashboard } from "./views";
import {
  NotFoundPage,
  ProtectedRoute,
  LoadingScreen,
  GlobalHeader,
} from "./components";
import Context from "./store/context";
import "antd/dist/antd.css";

function App() {
  const [pageLoading, setPageLoading] = useState(true);
  const { globalState, globalDispatch } = useContext(Context);
  const TOKEN_VALIDATE_URL = "/api/login";

  useEffect(() => {
    const verifyExistingToken = async () => {
      await axios.get(TOKEN_VALIDATE_URL).then(
        (response) => {
          const { success, data } = response.data;
          console.log("APP", response.data);
          if (success) {
            globalDispatch({ type: "LOGIN", userData: data });
          }
        },
        (err) => {
          console.error(err);
        }
      );
      setPageLoading(false);
    };

    if (!globalState.isAuthenticated) {
      verifyExistingToken();
    }
  }, [globalDispatch, globalState.isAuthenticated]);

  return pageLoading ? (
    <LoadingScreen />
  ) : (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Redirect to="/boards" />
        </Route>

        <Route path="/login" exact>
          <GlobalHeader component={Login} />
        </Route>

        <Route path="/signup" exact>
          <GlobalHeader component={Signup} />
        </Route>

        <ProtectedRoute path="/boards" component={Boards} exact />

        <ProtectedRoute
          path="/:board_id/dashboard"
          component={Dashboard}
          exact
        />

        <Route path="*">
          <GlobalHeader component={NotFoundPage} />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
