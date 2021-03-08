import React, { useState, useEffect, useContext } from "react";
import {
  Typography,
  Modal,
  Avatar,
  Layout,
  Button,
  Divider,
  Row,
  Col,
  message,
  AutoComplete,
} from "antd";
import { PropagateLoader } from "react-spinners";
import { HighlightOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import axios from "axios";
import UserIcon from "./UserIcon";
import Confirmation from "./Confirmation";
import Context from "../store/context";
import qs from "qs";

const { Title, Paragraph } = Typography;
const { Sider, Header, Content } = Layout;

export default function TaskDetail(props) {
  const { methods, updateTasksList } = props;
  const { id: task_id } = props.itemData;
  const { id: stage_id } = props.stageData;
  const { board_id } = useParams();
  const TASK_DATA_URL = `/api/${board_id}/dashboard/task?task_id=${task_id}`;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigned, setAssigned] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const { globalState } = useContext(Context);

  useEffect(() => {
    const getTaskDetails = async () => {
      await axios
        .get(TASK_DATA_URL)
        .then(
          (response) => {
            const { success, error, data } = response.data;
            console.log("getTaskDetails", response);
            if (success) {
              let alreadyJoined =
                data.assigned.find(
                  (user) => user.id === globalState.userData.id
                ) != null;

              setTitle(data.title);
              setDescription(data.description);
              setAssigned(data.assigned);
              setHasJoined(alreadyJoined);
            } else {
              message("Couldn't retrive task details");
              console.error(error);
            }
          },
          (err) => {
            console.error(`GET ${TASK_DATA_URL}`, err);
          }
        )
        .finally(() => {
          setPageLoading(false);
        });
    };

    const getMembers = async () => {
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
            console.log(data[0]);
            if (success) {
              setAutocompleteOptions(
                data[0].members.map((user) => ({
                  key: user.id,
                  value: user.name,
                }))
              );
            }
          },
          (error) => {
            console.error(error);
          }
        );
    };

    getMembers();
    getTaskDetails();
  }, [board_id, task_id]);

  const handleAddAssigned = (name, options) => {
    let { key: assigned_id } = options;

    if (assigned.filter((user) => user.id === assigned_id).length === 0) {
      const newlyAssigned = { id: assigned_id, name: name };
      methods.addAssigned(task_id, assigned_id, () => {
        setAssigned((previouslyAssigned) =>
          previouslyAssigned.concat([newlyAssigned])
        );
      });
    }
  };

  const handleRemoveAssigned = (remove_id) => {
    methods.removeAssigned(task_id, remove_id, () => {
      setAssigned((previouslyAssigned) =>
        previouslyAssigned.filter((user) => user.id !== remove_id)
      );
    });
  };

  const handleJoinTask = () => {
    methods.joinTask(task_id, () => {
      setHasJoined(true);
    });
  };

  const handleDeleteTask = () => {
    methods.deleteTask(task_id, stage_id, () => {
      updateTasksList(task_id, { toUpdate: "remove" }, () => {
        props.handleClose();
      });
    });
  };

  const handleChangeTitle = (newTitle) => {
    methods.changeTaskTitle(task_id, newTitle, () => {
      updateTasksList(task_id, { toUpdate: "title", newTitle }, () => {
        setTitle(newTitle);
      });
    });
  };

  const handleChangeDescription = (newDescription) => {
    methods.changeTaskDescription(task_id, newDescription, () => {
      setDescription(newDescription);
    });
  };

  const handleMoveTask = (to_stage) => {
    methods.moveTask(task_id, stage_id, to_stage.id, props.index, () => {
      message.success(`Task moved to ${to_stage.name}`);
    });
  };

  const renderPageLoadingScreen = (
    <div
      style={{
        minWidth: "100hw",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <PropagateLoader color="#1890ff" size={30} />
    </div>
  );

  return (
    <Modal
      visible={props.visible}
      footer={null}
      onCancel={props.handleClose}
      width="45vw"
      style={{ minWidth: 450 }}
    >
      {pageLoading ? (
        renderPageLoadingScreen
      ) : (
        <Layout style={{ backgroundColor: "transparent" }}>
          <Header
            style={{
              backgroundColor: "transparent",
              paddingLeft: 0,
            }}
          >
            <Title
              level={4}
              editable={{
                icon: <HighlightOutlined />,
                tooltip: "Edit title",
                onChange: handleChangeTitle,
              }}
            >
              {title}
            </Title>
          </Header>
          <Content>
            <Layout style={{ backgroundColor: "transparent" }}>
              <Content style={{ paddingRight: 20 }}>
                <Title level={5}>Description</Title>
                <Paragraph
                  editable={{
                    icon: <HighlightOutlined />,
                    tooltip: "Edit description",
                    onChange: handleChangeDescription,
                  }}
                >
                  {description}
                </Paragraph>
                <Title level={5}>Assigned</Title>
                <Row>
                  <AutoComplete
                    style={{ width: "100%" }}
                    placeholder="Add members to assign"
                    options={autocompleteOptions}
                    onSelect={handleAddAssigned}
                  ></AutoComplete>
                </Row>
                <Row>
                  <Avatar.Group maxCount={5} style={{ marginTop: 10 }}>
                    {assigned.map((eachMember) => (
                      <UserIcon
                        key={`${task_id}_${eachMember.id}`}
                        userData={eachMember}
                        showToolTip
                        showRemove
                        onRemove={handleRemoveAssigned}
                      />
                    ))}
                  </Avatar.Group>
                </Row>
              </Content>
              <Sider style={{ backgroundColor: "transparent" }}>
                <Row>
                  <Col span={12}>
                    <Button
                      onClick={handleJoinTask}
                      type="primary"
                      disabled={hasJoined}
                      style={{ width: "100%" }}
                    >
                      {hasJoined ? "Joined" : "Join Task"}
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Confirmation onConfirm={handleDeleteTask}>
                      <Button
                        type="dashed"
                        color="red"
                        style={{ width: "100%" }}
                      >
                        Delete Task
                      </Button>
                    </Confirmation>
                  </Col>
                </Row>
                <Divider />
                <Paragraph strong>Move to</Paragraph>
                <Row gutter={[0, 6]}>
                  {props.stagesList.map((join_stage) => {
                    return (
                      join_stage.id !== stage_id && (
                        <Col key={join_stage.id} span={24}>
                          <Button
                            block
                            type="dashed"
                            onClick={() => handleMoveTask(join_stage)}
                          >
                            {join_stage.name}
                          </Button>
                        </Col>
                      )
                    );
                  })}
                </Row>
              </Sider>
            </Layout>
          </Content>
        </Layout>
      )}
    </Modal>
  );
}
