import React, { Fragment } from "react";
import { Avatar, Tooltip, Button } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";

function UserIcon(props) {
  const { userData, showToolTip, showRemove, onRemove, ...rest } = props;

  const initials = (name) => {
    if (name) {
      return name
        .split(" ")
        .slice(0, 2)
        .map((word) => word.toUpperCase()[0])
        .join("");
    }
  };

  const tooltipTitle = () => {
    return (
      <Fragment>
        {userData.name}
        {showRemove ? (
          <Button
            type="text"
            icon={<CloseCircleOutlined size="large" />}
            onClick={() => onRemove(userData.id)}
          />
        ) : null}
      </Fragment>
    );
  };

  const renderAvatar = (
    <Avatar
      key={props.key}
      style={{
        backgroundColor: "green",
        verticalAlign: "middle",
        cursor: "pointer",
      }}
      {...rest}
    >
      {initials(userData.name)}
    </Avatar>
  );

  const renderToolTipAvatar = (
    <Tooltip key={props.key} title={tooltipTitle()} placement="top">
      {renderAvatar}
    </Tooltip>
  );

  return showToolTip ? renderToolTipAvatar : renderAvatar;
}

export default UserIcon;
