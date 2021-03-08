import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Layout, Row, Col, Button, Space, message } from "antd";
import { SyncOutlined, CheckCircleTwoTone } from "@ant-design/icons";
import { DragDropContext } from "react-beautiful-dnd";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { TasksList, AddMembers, LoadingScreen } from "../components";
import Context from "../store/context";
import "./Boards.css";

const { Header, Content } = Layout;

export default function Dashboard(props) {
  const { board_id } = useParams();
  const BASE_URL = `/api/${board_id}/dashboard`;
  const TASK_URL = `${BASE_URL}/task`;

  const [uploading, setUploading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  const [addMembersVisible, setAddMembersVisible] = useState(false);
  const [stages, setStages] = useState([]);
  const { globalState } = useContext(Context);
  const history = useHistory();

  console.log("STAGE DASHBOARD", stages);

  useEffect(() => {
    const getAllStages = async () => {
      axios
        .get(BASE_URL)
        .then(
          (response) => {
            const { success, error, data } = response.data;
            if (success) {
              const { stages, ...rest } = data;
              console.log("--------------DASHBOARD DATA--------------");
              console.log(data);
              setDashboardData(rest);
              setStages(stages);
            } else {
              history.push("/404");
              console.error(error);
            }
          },
          (err) => {
            history.push("/boards");
            console.error(`GET /${board_id}/dashboard/`, err);
          }
        )
        .finally(() => {
          setPageLoading(false);
        });
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

    console.log("addTask request starting....");
    await axios
      .post(TASK_URL, payload)
      .then(
        (response) => {
          console.log("got some response at line 82....", response.data);
          const { success, error, data } = response.data;

          if (success) {
            let newTask = { ...data, position: position };
            setStages((prevStages) =>
              prevStages.map((stage) => {
                if (stage.id === stage_id) {
                  return {
                    ...stage,
                    tasks: stage.tasks.concat(newTask),
                  };
                } else return stage;
              })
            );
            callback(data, error);
          }
        },
        (error) => {
          console.log("got error at line 86....", error);
          callback(null, error);
        }
      )
      .finally(() => {
        console.log("setUploading to false....");
        setUploading(false);
      });
  };

  const deleteTask = async (task_id, stage_id, callback) => {
    setUploading(true);
    let payload = { task_id: task_id, stage_id: stage_id };
    axios
      .delete(TASK_URL, { data: payload })
      .then(
        (response) => {
          const { success, error, data } = response.data;

          if (success) {
            setStages((prevStages) =>
              prevStages.map((stage) => {
                if (stage.id === stage_id) {
                  return {
                    ...stage,
                    tasks: stage.tasks.filter(
                      (eachTask) => eachTask.id !== task_id
                    ),
                  };
                } else return stage;
              })
            );
            callback(data, error);
          }
        },
        (error) => {
          callback(null, error);
        }
      )
      .finally(() => {
        console.log("deleted task....");
        setUploading(false);
      });
  };

  const updateTask = async (payload, callback) => {
    setUploading(true);
    console.log("updateTask line 105");
    axios
      .put(TASK_URL, payload)
      .then(
        (response) => {
          const { error, success } = response.data;
          console.log("FINAL RESPONSE", response.data);
          if (success) return callback();
          return callback(error);
        },
        (error) => {
          return callback(error);
        }
      )
      .finally(() => {
        console.log("updated task....");
        setUploading(false);
      });
  };

  const updateStages = async (payload, callback) => {
    console.log("updateStages PAYLOAD", payload);
    axios.put(BASE_URL, payload).then(
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
      callback: callback,
    };
    onDragEnd(result);
  };

  const changeTaskTitle = (task_id, title, callback) => {
    let payload = { task_id, title };
    console.log("changeTaskTitle line: 170");
    updateTask(payload, callback);
  };

  const changeTaskDescription = (task_id, description, callback) => {
    let payload = { task_id, description };
    updateTask(payload, callback);
  };

  // methods exposed to the children to ask parent for backend uploads
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

  // resets the position attribute tasks after each drag and drop
  const resetTasksPosition = (stage) => {
    stage.tasks = stage.tasks
      .filter((eachTask) => eachTask != null)
      .map((eachTask, newPosition) => {
        eachTask.position = newPosition;
        return eachTask;
      });
    return stage;
  };

  // called when task is moved in the same stage itself
  const reorder = (source, destination) => {
    console.log("BEFORE REORDER stages", stages);
    const stageId = source.droppableId;
    const prevTaskIndex = source.index;
    const newTaskIndex = destination.index;

    console.log("REORDER SOURCE", source);
    console.log("REORDER DEST", destination);

    const stageIndex = stages.map((eachStage) => eachStage.id).indexOf(stageId);
    let foundStage = { ...stages[stageIndex] };

    console.log("BEFORE STAGE", foundStage);
    const [updateTask] = foundStage.tasks.splice(prevTaskIndex, 1);

    foundStage.tasks.splice(newTaskIndex, 0, updateTask);
    foundStage = resetTasksPosition(foundStage);

    console.log("AFTER STAGE", foundStage);
    return { foundStage, stageIndex };
  };

  // called when task is transferred from one stage to other
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
    final_index = final_index === -1 ? toStage.tasks.length : final_index;
    toStage.tasks.splice(final_index, 0, updateTask);

    toStage = resetTasksPosition(toStage);
    fromStage = resetTasksPosition(fromStage);

    return { fromStage, fromStageId, toStage, toStageId };
  };

  const onDragEnd = async (result) => {
    setUploading(true);
    const { source: fromStage, destination: toStage, callback } = result;
    let payload = { stages: [] };

    // dropped outside, ignore it
    if (!toStage) {
      setUploading(false);
      return;
    }

    // ids are same, means drag and drop in same stage, update
    // the stage only if index of the task has changed
    if (fromStage.droppableId === toStage.droppableId) {
      if (fromStage.index === toStage.index) {
        setUploading(false);
        return;
      }

      let { foundStage: reorderedStage, stageIndex } = reorder(
        fromStage,
        toStage
      );

      payload.stages = [reorderedStage];

      setStages((prevStages) =>
        prevStages.map((stage, index) =>
          index === stageIndex ? reorderedStage : stage
        )
      );
    }

    // otherwise task is dragged between stages, the payload
    // will contain both the stages re-arranged
    else {
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
        return newStages;
      });
    }

    updateStages(payload, (error) => {
      setUploading(false);
      if (error) message.error("Failed to update dashboard");
      else if (callback) {
        callback();
      }
    });
  };

  return pageLoading ? (
    <LoadingScreen />
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
