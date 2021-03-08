import React, { useState, useEffect, useContext } from "react";
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
import { useParams } from "react-router-dom";
import axios from "axios";
import Context from "../store/context";
import UserIcon from "./UserIcon";
import qs from "qs";

function AddMembers(props) {
  const { board_id } = useParams();
  const { globalState } = useContext(Context);

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [autocompleteOptions, setAutocompleteOptions] = useState();

  useEffect(() => {
    const getMembers = async () => {
      const onError = (error) => {
        console.error(error);
        props.onClose();
      };

      axios
        .get("/api/boards/multiple", {
          params: { boardIds: JSON.stringify([board_id]) },
          paramsSerializer: (params) => {
            return qs.stringify(params);
          },
        })
        .then(
          (response) => {
            const { success, error, data } = response.data;
            let currentBoard = data == null ? null : data[0];
            if (success && currentBoard) {
              setSelectedMembers(data[0].members);
            } else {
              onError(error);
            }
          },
          (error) => {
            onError(error);
          }
        );
    };

    getMembers();
  }, []);

  const handleSearch = async (event) => {
    // const name = event.target.value;
    const name = event;
    if (name.length > 0) {
      axios.get(`/api/users/search?q=${name}`).then((response) => {
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

  const updateMembersList = () => {
    let payload = {
      board_id,
      members: selectedMembers.map((member) => member.id),
    };
    axios.put("/api/boards", payload).then(
      (response) => {
        const { success, data, error } = response.data;
        if (success) {
          console.log(data);
          message.success("Successfully updated members");
        } else {
          message.error("Failed to update members");
          console.error(error);
        }
      },
      (error) => {
        message.error("Failed to update members");
        console.error(error);
      }
    );
  };

  return (
    <Modal
      title="Add members"
      visible={props.visible}
      footer={null}
      onCancel={props.onClose}
    >
      <Row gutter={[0, 20]}>
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
          <Button block type="primary" onClick={updateMembersList}>
            Update
          </Button>
        </Col>
      </Row>
    </Modal>
  );
}

export default AddMembers;
