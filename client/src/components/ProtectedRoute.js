import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import Context from "../store/context";
import withGlobalHeader from "../hoc/withGlobalHeader";

function ProtectedRoute({ component: Component, ...rest }) {
  const { globalState } = useContext(Context);

  console.log("GLOBAL STATE", globalState);

  return (
    <Route
      {...rest}
      render={(routeProps) => {
        return globalState.isAuthenticated ? (
          withGlobalHeader(<Component {...routeProps} />)
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
