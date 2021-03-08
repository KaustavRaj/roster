import React from "react";
import { PropagateLoader } from "react-spinners";

function LoadingScreen() {
  return (
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
  );
}

export default LoadingScreen;
