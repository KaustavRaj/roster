import React, { useState, useContext } from "react";
import { Row, Col, Button, Popover } from "antd";
import { PoweroffOutlined } from "@ant-design/icons";
import { useHistory, Link } from "react-router-dom";
import axios from "axios";
import UserIcon from "./UserIcon";
import Context from "../store/context";

export default function AppBar() {
  const [profileInfoVisible, setProfileInfoVisible] = useState(false);
  const { globalState, globalDispatch } = useContext(Context);
  const history = useHistory();

  const handleProfileVisibilityChange = (visible) => {
    setProfileInfoVisible(visible);
  };

  const handleLogout = () => {
    axios.post("/api/logout").then(
      (response) => {
        if (response.data.success) {
          globalDispatch({ type: "LOGOUT" });
          history.push("/login");
        }
      },
      (error) => {
        console.log("error", error);
      }
    );
  };

  const handleLogin = () => {
    history.push("/login");
  };

  const LeftComponent = () => {
    return null;
  };

  const CenterComponent = () => {
    return (
      <Link to="/boards">
        <div style={{ textAlign: "center", fontSize: 24, color: "white" }}>
          Roster
        </div>
      </Link>
    );
  };

  const RightComponent = () => {
    return (
      <Row justify="end" align="middle">
        <Col>
          {globalState.isAuthenticated ? (
            <Popover
              placement="bottomRight"
              content={<ProfileContent />}
              trigger="click"
              visible={profileInfoVisible}
              onVisibleChange={handleProfileVisibilityChange}
            >
              <UserIcon userData={globalState.userData} />
            </Popover>
          ) : (
            <Button ghost onClick={handleLogin}>
              Log In
            </Button>
          )}
        </Col>
      </Row>
    );
  };

  const ProfileContent = () => {
    return (
      <Button
        type="text"
        icon={<PoweroffOutlined key="setting" />}
        style={{ padding: 0 }}
        onClick={handleLogout}
      >
        Log out
      </Button>
    );
  };

  return (
    <header
      style={{
        backgroundColor: "#046994",
        paddingTop: 5,
        paddingBottom: 5,
        paddingRight: 32,
        paddingLeft: 32,
        minHeight: "5vh",
      }}
    >
      <Row align="middle">
        {/* Left component */}
        <Col span={8}>
          <LeftComponent />
        </Col>
        {/* Center component */}
        <Col span={8}>
          <CenterComponent />
        </Col>
        {/* Right component */}
        <Col span={8}>
          <RightComponent />
        </Col>
      </Row>
    </header>
  );
}
