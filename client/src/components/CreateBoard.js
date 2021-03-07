import React, { useState, useContext } from "react";
import {
  Row,
  Col,
  Modal,
  Input,
  Button,
  Avatar,
  message,
  AutoComplete,
} from "antd";
import axios from "axios";
import Context from "../store/context";
import UserIcon from "./UserIcon";
import "./CreateBoard.css";

export default function CreateBoard(props) {
  const { globalState } = useContext(Context);
  const { id, name } = globalState.userData;

  const [boardName, setBoardName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([{ id, name }]);
  const [autocompleteOptions, setAutocompleteOptions] = useState();

  const handleNameChange = (event) => {
    setBoardName(event.target.value);
  };

  const handleSearch = async (event) => {
    // const name = event.target.value;
    const name = event;
    if (name.length > 0) {
      axios.get(`/users/search?q=${name}`).then((response) => {
        const { data } = response.data;
        console.log(data);
        if (data.length) {
          setAutocompleteOptions(
            data.map((user) => ({ key: user.id, value: user.name }))
          );
        } else {
          setAutocompleteOptions([]);
        }
      });
    }
  };

  const handleRemoveMember = (remove_id) => {
    if (remove_id === globalState.userData.id) return;
    setSelectedMembers((previousMembers) =>
      previousMembers.filter((user) => user.id !== remove_id)
    );
  };

  const handleSelectSearchedData = (name, options) => {
    setAutocompleteOptions([]);
    if (
      selectedMembers.filter((user) => user.id === options.key).length === 0
    ) {
      const newMember = { id: options.key, name: options.value };
      setSelectedMembers((previousMembers) =>
        previousMembers.concat([newMember])
      );
    }
  };

  const handleCreatePress = () => {
    const payload = {
      name: boardName,
      members: selectedMembers.map((member) => member.id),
    };

    const onSuccess = (response) => {
      const { success, error, data } = response.data;

      if (success) {
        message.success(`${boardName} created successfully`);
        props.onCreate(data);
      } else {
        console.log("HERE");
        onError(error);
      }
    };

    const onError = (error) => {
      message.error(`Failed to create board`);
      console.error("POST /boards : ", error);
    };

    axios
      .post(
        "/boards",
        { data: { ...payload } },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(onSuccess, onError);

    props.onClose();
  };

  return (
    <Modal
      title="New Board"
      visible={props.visible}
      footer={null}
      onCancel={props.onClose}
    >
      <Row gutter={[0, 20]}>
        <Col span={24}>
          <Input
            size="large"
            placeholder="Board name"
            className="rounded"
            onChange={handleNameChange}
            value={boardName}
          />
        </Col>
        <Col span={24}>
          <AutoComplete
            style={{ width: "100%" }}
            onSearch={handleSearch}
            options={autocompleteOptions}
            onSelect={handleSelectSearchedData}
          >
            <Input.Search size="large" placeholder="Add members" enterButton />
          </AutoComplete>
        </Col>
        <Col span={24}>
          <strong>Members</strong>
        </Col>
        <Col span={24}>
          <Avatar.Group maxCount={5}>
            {selectedMembers.map((eachMember) => (
              <UserIcon
                showToolTip
                showRemove
                key={eachMember.id}
                userData={eachMember}
                onRemove={handleRemoveMember}
              />
            ))}
          </Avatar.Group>
        </Col>
        <Col span={24}>
          <Button block type="primary" onClick={handleCreatePress}>
            Create
          </Button>
        </Col>
      </Row>
    </Modal>
  );
}
