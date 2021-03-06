import React, { useState, useEffect, useContext } from "react";
import { Row, Col, Button, Input, message } from "antd";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
import { Droppable } from "react-beautiful-dnd";
import TaskItem from "./TaskItem";
import Context from "../store/context";

export default function TaskList(props) {
  const { methods, stageData } = props;
  let { tasks: tasksList, ...stageMeta } = stageData;
  tasksList = tasksList.sort((task1, task2) => task1.position - task2.position);

  const [tasks, setTasks] = useState(tasksList);
  const [addCardVisible, setAddCardVisible] = useState(false);
  const [title, setTitle] = useState("");
  const { globalState, globalDispatch } = useContext(Context);

  useEffect(() => {}, [tasks]);

  const handleAddCard = async () => {
    if (title.length > 0) {
      await methods.addTask(stageMeta.id, title, (newTask, error) => {
        if (error) {
          message.error(`Failed to create task`);
        } else {
          newTask.position = tasks.length;
          setTasks((prevTasks) => {
            prevTasks.concat(newTask);
            return prevTasks;
          });
        }
        handleCloseAddCard();
      });
    }
  };

  const handleOpenAddCard = () => {
    setAddCardVisible(true);
  };

  const handleCloseAddCard = () => {
    setTitle("");
    setAddCardVisible(false);
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const listHeader = (
    <Row
      justify="space-between"
      style={{
        width: "100%",
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 20,
        paddingRight: 10,
      }}
    >
      <Col>
        <strong>{stageMeta.name}</strong>
      </Col>
    </Row>
  );

  const listFooter = (
    <div
      style={{
        width: "100%",
        paddingBottom: 5,
        paddingTop: 5,
        marginLeft: 6,
        marginRight: 6,
        marginBottom: 5,
        marginTop: 4,
      }}
    >
      {addCardVisible ? (
        <>
          <Input
            style={{
              backgroundColor: "white",
              paddingTop: 5,
              paddingBottom: 5,
              paddingLeft: 10,
              borderRadius: 4,
              marginBottom: 10,
              boxShadow: "0px 2px 0px rgba(0,0,0,0.1)",
              cursor: "text",
            }}
            placeholder="Enter a title for this card..."
            onPressEnter={handleAddCard}
            onChange={handleTitleChange}
          />
          <Button
            style={{
              backgroundColor: "green",
              color: "white",
              borderRadius: 5,
            }}
            onClick={handleAddCard}
          >
            Add Card
          </Button>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={handleCloseAddCard}
          />
        </>
      ) : (
        <Button type="text" icon={<PlusOutlined />} onClick={handleOpenAddCard}>
          Add another card
        </Button>
      )}
    </div>
  );

  return (
    <Row
      style={{
        backgroundColor: "rgba(0,0,0,0.1)",
        borderRadius: 5,
      }}
    >
      {listHeader}
      <Droppable droppableId={stageMeta.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ width: "100%" }}
          >
            {tasks.map((eachCard, index) => (
              <Col key={eachCard.id} span={24}>
                <TaskItem
                  key={eachCard.id}
                  itemData={eachCard}
                  index={index}
                  {...props}
                />
              </Col>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      {listFooter}
    </Row>
  );
}
