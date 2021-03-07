import React from "react";
import { PropagateLoader } from "react-spinners";

function LoadingScreen({ loading, children }) {
  <div
    style={{
      minWidth: "100hw",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    loading ?
    <PropagateLoader color="#1890ff" size={30} />: {children}
  </div>;
}

export default LoadingScreen;
