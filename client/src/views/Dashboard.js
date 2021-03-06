import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Layout, Row, Col, Button, Space, message } from "antd";
import { SyncOutlined, CheckCircleTwoTone } from "@ant-design/icons";
import { PropagateLoader } from "react-spinners";
import { DragDropContext } from "react-beautiful-dnd";
import axios from "axios";
import { TasksList, AddMembers } from "../components";
import Context from "../store/context";
import "./Boards.css";

const { Header, Content } = Layout;

export default function Dashboard(props) {
  const { board_id } = useParams();
  const BASE_URL = `/${board_id}/dashboard`;
  const TASK_URL = `${BASE_URL}/task`;

  const [uploading, setUploading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  const [addMembersVisible, setAddMembersVisible] = useState(false);
  const [stages, setStages] = useState([]);
  const [members, addMembers] = useState([]);
  const { globalState, globalDispatch } = useContext(Context);

  console.log("STAGE DASHBOARD", stages);

  useEffect(() => {
    const getAllStages = async () => {
      axios.get(BASE_URL).then(
        (response) => {
          const { success, error, data } = response.data;
          if (success) {
            const { stages, ...rest } = data;
            setDashboardData(rest);
            setStages(stages);
          } else {
            console.error(error);
          }
        },
        (err) => {
          console.error(`GET /${board_id}/dashboard/`, err);
        }
      );

      setPageLoading(false);
    };

    getAllStages();
  }, [board_id]);

  const openAddMembers = () => {
    setAddMembersVisible(true);
  };

  const closeAddMembers = () => {
    setAddMembersVisible(false);
  };

  const addTask = async (stage_id, title, callback) => {
    setUploading(true);
    let position = stages.filter((stage) => stage.id === stage_id)[0].tasks
      .length;
    let payload = {
      stage_id: stage_id,
      title: title,
      position: position,
    };
    console.log("PAYLOAD", payload);

    axios
      .post(TASK_URL, payload)
      .then(
        (response) => {
          callback(response.data.data, response.data.error);
        },
        (error) => {
          callback(null, error);
        }
      )
      .finally(() => {
        setUploading(false);
      });
  };

  const deleteTask = async (task_id, stage_id, callback) => {
    let payload = { task_id: task_id, stage_id: stage_id };
    axios.delete(TASK_URL, { data: payload }).then(
      (response) => {
        callback(response.data.data, response.data.error);
      },
      (error) => {
        callback(null, error);
      }
    );
  };

  const updateTask = async (payload, callback) => {
    axios.put(
      TASK_URL,
      payload,
      (response) => {
        const { error, success } = response.data;
        if (success) return callback();
        return callback(error);
      },
      (error) => {
        return callback(error);
      }
    );
  };

  const updateStages = async (payload, callback) => {
    axios.put(
      BASE_URL,
      payload,
      (response) => {
        const { error, success } = response.data;
        if (success) return callback();
        return callback(error);
      },
      (error) => {
        return callback(error);
      }
    );
  };

  const changeAssigned = async (
    task_id,
    assigned_id,
    assignedType,
    callback
  ) => {
    let payload = { task_id, assigned_id, assignedType };
    updateTask(payload, callback);
  };

  const addAssigned = (task_id, assigned_id, callback) => {
    changeAssigned(task_id, assigned_id, "ADD", callback);
  };

  const joinTask = (task_id, callback) => {
    addAssigned(task_id, globalState.userData.id, callback);
  };

  const removeAssigned = (task_id, assigned_id, callback) => {
    changeAssigned(task_id, assigned_id, "DELETE", callback);
  };

  const moveTask = (
    task_id,
    from_stage_id,
    to_stage_id,
    current_stage_index,
    callback
  ) => {
    let result = {
      source: { droppableId: from_stage_id, index: current_stage_index },
      destination: { droppableId: to_stage_id, index: -1 },
    };
    onDragEnd(result, callback);
  };

  const changeTaskTitle = (task_id, title, callback) => {
    let payload = { task_id, title };
    updateTask(payload, callback);
  };

  const changeTaskDescription = (task_id, description, callback) => {
    let payload = { task_id, description };
    updateTask(payload, callback);
  };

  const methods = {
    addTask,
    deleteTask,
    joinTask,
    addAssigned,
    removeAssigned,
    moveTask,
    changeTaskTitle,
    changeTaskDescription,
    updateStages,
  };

  const resetTasksPosition = (stage) => {
    stage.tasks = stage.tasks.map((eachTask, newPosition) => {
      eachTask.position = newPosition;
      return eachTask;
    });
    return stage;
  };

  const reorder = (fromStage, toStage) => {
    const stageId = fromStage.droppableId;
    const prevTaskIndex = fromStage.index;
    const newTaskIndex = toStage.index;
    const stageIndex = stages.map((eachStage) => eachStage.id).indexOf(stageId);
    let foundStage = stages[stageIndex];

    const [updateTask] = foundStage.tasks.splice(prevTaskIndex, 1);
    foundStage.tasks.splice(newTaskIndex, 0, updateTask);
    foundStage = resetTasksPosition(foundStage);

    return { foundStage, stageIndex };
  };

  const transfer = (source, destination) => {
    const fromStageId = stages
      .map((eachStage) => eachStage.id)
      .indexOf(source.droppableId);
    const toStageId = stages
      .map((eachStage) => eachStage.id)
      .indexOf(destination.droppableId);
    let fromStage = stages[fromStageId];
    let toStage = stages[toStageId];
    let [updateTask] = fromStage.tasks.splice(source.index, 1);

    // note that if destination index is "-1", means place at the end
    let final_index = destination.index;
    final_index = final_index === -1 ? fromStage.length : final_index;
    toStage.tasks.splice(final_index, 0, updateTask);

    toStage = resetTasksPosition(toStage);
    fromStage = resetTasksPosition(fromStage);

    return { fromStage, fromStageId, toStage, toStageId };
  };

  const onDragEnd = async (result, callback) => {
    setUploading(true);
    const { source: fromStage, destination: toStage } = result;
    let payload = { stages: [] };

    // dropped outside
    if (!toStage) {
      setUploading(false);
      return;
    }

    if (fromStage.droppableId === toStage.droppableId) {
      // update in same stage only if index of task has changed
      if (fromStage.index === toStage.index) {
        setUploading(false);
        return;
      }

      let { stage: reorderedStage, stageIndex } = reorder(fromStage, toStage);
      payload.stages = [reorderedStage];

      setStages((prevStages) => {
        console.log("REORDERED STAGE", reorderedStage);
        const newStages = [...prevStages];
        newStages[stageIndex] = reorderedStage;
        return newStages;
      });
    } else {
      // update across stages
      const {
        fromStage: from,
        fromStageId: fromId,
        toStage: to,
        toStageId: toId,
      } = transfer(fromStage, toStage);
      payload.stages = [from, to];

      setStages((prevStages) => {
        const newStages = [...prevStages];
        newStages[fromId] = from;
        newStages[toId] = to;
        console.log("CHANGED STAGES");
        console.log(from);
        console.log(to);
        return newStages;
      });
    }

    updateStages(payload, (error) => {
      if (error) message.error("Failed to update dashboard");
      setUploading(false);
    });

    if (callback) {
      callback();
    }
  };

  // const handleUpload = () => {
  //   setUploading(true);
  //   setTimeout(() => {
  //     setUploading(false);
  //   }, 2000);
  // };

  const pageLoadingScreen = (
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

  return pageLoading ? (
    pageLoadingScreen
  ) : (
    <DragDropContext onDragEnd={onDragEnd}>
      <Layout
        style={{
          backgroundColor: "transparent",
        }}
      >
        <Layout
          style={{
            paddingTop: 0,
            paddingRight: 32,
            paddingLeft: 32,
            backgroundColor: "transparent",
          }}
        >
          <Header
            style={{
              backgroundColor: "transparent",
              paddingLeft: 0,
              paddingRight: 0,
            }}
          >
            <Row align="middle">
              <Col span={12}>
                <div className="title">{dashboardData.name}</div>
              </Col>
              <Col span={12}>
                <Row align="end" justify="middle">
                  <Space>
                    <Col>
                      {uploading ? (
                        <SyncOutlined
                          spin
                          style={{ color: "red", fontSize: 20 }}
                        />
                      ) : (
                        <CheckCircleTwoTone
                          twoToneColor="#52c41a"
                          style={{ fontSize: 20 }}
                        />
                      )}
                    </Col>
                    <Col>
                      <Button type="primary" onClick={openAddMembers}>
                        Add members
                      </Button>
                      <AddMembers
                        visible={addMembersVisible}
                        onClose={closeAddMembers}
                      />
                    </Col>
                  </Space>
                </Row>
              </Col>
            </Row>
          </Header>
          <Content>
            <Row gutter={[0, 12]}>
              {stages.map((eachStage) => (
                <div key={eachStage.id} style={{ marginRight: 10, width: 250 }}>
                  <TasksList
                    stageData={eachStage}
                    methods={methods}
                    stagesList={stages}
                  />
                </div>
              ))}
            </Row>
          </Content>
        </Layout>
      </Layout>
    </DragDropContext>
  );
}
