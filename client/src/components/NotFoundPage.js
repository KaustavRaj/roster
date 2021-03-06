import React from "react";
import { Result } from "antd";

function NotFoundPage(props) {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you're looking for does not exist."
    />
  );
}

export default NotFoundPage;
