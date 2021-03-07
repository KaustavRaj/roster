import React, { useEffect, useContext, useState } from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import axios from "axios";
import { PropagateLoader } from "react-spinners";
import { Boards, Login, Signup, Dashboard } from "./views";
import { NotFoundPage, ProtectedRoute } from "./components";
import withGlobalHeader from "./hoc/withGlobalHeader";
import Context from "./store/context";
import "antd/dist/antd.css";

function App() {
  const [pageLoading, setPageLoading] = useState(true);
  const { globalState, globalDispatch } = useContext(Context);

  useEffect(() => {
    const verifyExistingToken = async () => {
      await axios.get("/login").then(
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
    <div
      style={{
        minWidth: "100hw",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <PropagateLoader color="#1890ff" size={30} />
    </div>
  ) : (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Redirect to="/boards" />
        </Route>
        <Route path="/login" exact>
          {withGlobalHeader(<Login />)}
        </Route>
        <Route path="/signup" exact>
          {withGlobalHeader(<Signup />)}
        </Route>
        <ProtectedRoute exact path="/boards" component={Boards} />
        <ProtectedRoute
          exact
          path="/:board_id/dashboard"
          component={Dashboard}
        />
        <Route path="*">{withGlobalHeader(<NotFoundPage />)}</Route>
      </Switch>
    </Router>
  );
}

export default App;
