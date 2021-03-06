import React from "react";
import { PropagateLoader } from "react-spinners";

function LoadingScreen({ loading, component }) {
  // console.log("children", children);

  return loading ? (
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
    { component }
  );
}

export default LoadingScreen;
