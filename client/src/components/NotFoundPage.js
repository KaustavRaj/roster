import React from "react";
import { Result, Button } from "antd";
import { Link } from "react-router-dom";

function NotFoundPage(props) {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you're looking for does not exist."
      extra={
        <Link to="/boards">
          <Button type="primary">Back Home</Button>
        </Link>
      }
    />
  );
}

export default NotFoundPage;
