import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import Context from "../store/context";
import GlobalHeader from "./GlobalHeader";

/**
 *
 * @param {*} component Route component
 * @returns a wrapper around Route component which allows
 * only an authorized user to access routes other than
 * login/signup; otherwise redirects to /login
 */
function ProtectedRoute({ component: Component, ...rest }) {
  const { globalState } = useContext(Context);

  console.log("GLOBAL STATE", globalState);

  return (
    <Route
      {...rest}
      render={(routeProps) => {
        return globalState.isAuthenticated ? (
          <GlobalHeader component={Component} {...routeProps} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: routeProps.location },
            }}
          />
        );
      }}
    />
  );
}

export default ProtectedRoute;
