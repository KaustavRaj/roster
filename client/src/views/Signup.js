import React, { useState, useContext } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Form, Input, Button, Checkbox, Row, Typography } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import Context from "../store/context";
import axios from "axios";
import "antd/dist/antd.css";
import "./Login.css";

export default function Signup(props) {
  const [error, setError] = useState(null);
  const history = useHistory();
  const location = useLocation();
  const { globalState, globalDispatch } = useContext(Context);

  if (globalState.isAuthenticated) {
    history.replace("/boards");
  }

  const handleFormSubmit = (payload) => {
    axios
      .post("/signup", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(
        (response) => {
          const { success, error, data } = response.data;
          if (success) {
            globalDispatch({ type: "LOGIN", data: data });
            let { from } = location.state || { from: { pathname: "/boards" } };
            // history.replace(from);
            history.push("/boards");
          } else {
            setError(error);
          }
        },
        (err) => {
          console.log("error", err);
        }
      );
  };

  return (
    <div className="main">
      <Form
        name="normal_login"
        className="login-form"
        initialValues={{
          remember: true,
        }}
        onFinish={handleFormSubmit}
      >
        <Typography.Text type="danger">{error}</Typography.Text>
        <Form.Item
          name="name"
          rules={[
            {
              required: true,
              message: "Name can't be empty",
            },
          ]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Name"
          />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: "Email can't be empty",
            },
          ]}
        >
          <Input
            prefix={<MailOutlined className="site-form-item-icon" />}
            placeholder="Email"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "Password can't be empty",
            },
          ]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            Register
          </Button>
          <div style={{ marginTop: 10 }}>
            Already have an account ? <Link to="/login">Login here</Link>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}