import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import { Form, Input, Button, Typography, Row, Col, message } from "antd";
import { MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import Context from "../store/context";
import axios from "axios";
import "./Forms.css";

export default function Forms(props) {
  const { formType, formTitle, url, footer } = props;
  const history = useHistory();
  const { globalState, globalDispatch } = useContext(Context);

  if (globalState.isAuthenticated) {
    history.replace("/boards");
  }

  const handleFormSubmit = (payload) => {
    axios
      .post(url, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(
        (response) => {
          const { success, error, data } = response.data;
          if (success) {
            globalDispatch({ type: "LOGIN", userData: data });
            history.push("/boards");
          } else {
            message.error(`Failed to ${formType}`);
            console.error(error);
          }
        },
        (err) => {
          message.error(`Failed to ${formType}`);
          console.error(err);
        }
      );
  };

  return (
    <div className="main">
      <div className="box">
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{
            remember: true,
          }}
          onFinish={handleFormSubmit}
        >
          <Typography.Title
            style={{ color: "rgba(0,0,0,0.8)", textAlign: "center" }}
            level={2}
          >
            {formTitle}
          </Typography.Title>
          {formType === "signup" && (
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
                size="large"
                allowClear
                className="rounded"
              />
            </Form.Item>
          )}
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Please enter valid email",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
              allowClear
              className="rounded"
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
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
              allowClear
              className="rounded"
            />
          </Form.Item>
          <Row gutter={[0, 10]}>
            <Col span={24}>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
                shape="round"
              >
                {formType === "login" ? "Log in" : "Register"}
              </Button>
            </Col>
            {footer && <Col span={24}>{footer}</Col>}
          </Row>
        </Form>
      </div>
    </div>
  );
}
