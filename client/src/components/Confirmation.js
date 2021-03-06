import React, { useState } from "react";
import { Popconfirm } from "antd";

function Confirmation({ children, onConfirm }) {
  const [popconfirmVisible, setPopconfirmVisible] = useState(false);

  const handleVisibleChange = (visible) => {
    setPopconfirmVisible(visible);
  };

  const hidePopconfirm = () => {
    setPopconfirmVisible(false);
  };

  const handleConfirm = () => {
    hidePopconfirm();
    onConfirm();
  };

  return (
    <Popconfirm
      title="Are you sure you want to delete this?"
      visible={popconfirmVisible}
      onVisibleChange={handleVisibleChange}
      onConfirm={handleConfirm}
      onCancel={hidePopconfirm}
      okText="Yes"
      cancelText="No"
    >
      {children}
    </Popconfirm>
  );
}

export default Confirmation;
