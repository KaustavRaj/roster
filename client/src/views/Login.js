import React, { useState, useContext } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Form, Input, Button, Checkbox, Row, Typography } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import Context from "../store/context";
import axios from "axios";
import "antd/dist/antd.css";
import "./Login.css";

export default function Login(props) {
  const [error, setError] = useState(null);
  const history = useHistory();
  const location = useLocation();
  const { globalState, globalDispatch } = useContext(Context);

  if (globalState.isAuthenticated) {
    history.replace("/boards");
  }

  const handleFormSubmit = (payload) => {
    axios
      .post("/login", payload, {
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
        {/* <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <a className="login-form-forgot" href="">
            Forgot password
          </a>
        </Form.Item> */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            Log in
          </Button>
          <div style={{ marginTop: 10 }}>
            No accounts yet ? <Link to="/signup">Register now !</Link>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}
