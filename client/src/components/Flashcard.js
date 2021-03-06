import React from "react";
import { Card, Avatar, Button } from "antd";
import { DeleteTwoTone } from "@ant-design/icons";
import { Link } from "react-router-dom";
import UserIcon from "./UserIcon";
import Confirmation from "./Confirmation";
import "./Flashcard.css";

export default function FlashCard(props) {
  const maxAvatarDisplay = 3;
  const linkTo = `/${props.id}/dashboard`;

  return (
    <Card
      headStyle={{ color: "white" }}
      title={props.name}
      hoverable
      className="flashcard"
      style={{ backgroundColor: "#3482c2" }}
      extra={
        <Confirmation onConfirm={() => props.onDelete(props.id)}>
          <Button
            shape="circle"
            type="text"
            icon={<DeleteTwoTone twoToneColor="black" />}
          />
        </Confirmation>
      }
    >
      <Link to={linkTo}>
        <Avatar.Group maxCount={maxAvatarDisplay}>
          {props.members.map((eachMember) => (
            <UserIcon
              key={`${props.id}_${eachMember.id}`}
              userData={eachMember}
              showToolTip
            />
          ))}
        </Avatar.Group>
      </Link>
    </Card>
  );
}
