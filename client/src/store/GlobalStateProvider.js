import React from "react";
import useGlobalState from "../hooks/useGlobalState";
import Context from "./context";

function GlobalStateProvider(props) {
  const { children } = props;
  return (
    <Context.Provider value={useGlobalState()}>{children}</Context.Provider>
  );
}

export default GlobalStateProvider;
