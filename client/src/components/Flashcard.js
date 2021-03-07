import React from "react";
import { Card, Avatar, Button } from "antd";
import { DeleteTwoTone } from "@ant-design/icons";
import { Link } from "react-router-dom";
import UserIcon from "./UserIcon";
import Confirmation from "./Confirmation";
import "./Flashcard.css";

export default function FlashCard(props) {
  const { boardData, onDelete } = props;
  const maxAvatarDisplay = 3;
  const linkTo = `/${boardData.id}/dashboard`;

  return (
    <Link to={linkTo}>
      <Card
        title={boardData.name}
        hoverable
        className="flashcard"
        style={{ backgroundColor: "rgba(36, 145, 227, 0.7)" }}
        extra={
          <Confirmation onConfirm={() => onDelete(boardData.id)}>
            <Button
              shape="circle"
              type="text"
              icon={<DeleteTwoTone twoToneColor="black" />}
            />
          </Confirmation>
        }
      >
        <Avatar.Group maxCount={maxAvatarDisplay}>
          {boardData.members.map((eachMember) => (
            <UserIcon
              key={`${boardData.id}_${eachMember.id}`}
              userData={eachMember}
              showToolTip
            />
          ))}
        </Avatar.Group>
      </Card>
    </Link>
  );
}
