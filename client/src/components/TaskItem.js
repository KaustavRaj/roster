import React from "react";
import { Draggable } from "react-beautiful-dnd";
import TaskDetail from "./TaskDetail";

export default function TaskItem(props) {
  const { itemData, index } = props;
  const [taskDetailVisible, setTaskDetailVisible] = React.useState(false);

  const handleTaskDetailOpen = () => {
    setTaskDetailVisible(true);
  };

  const handleTaskDetailClose = () => {
    setTaskDetailVisible(false);
  };

  if (itemData) {
    return (
      <Draggable draggableId={itemData.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.dragHandleProps}
            {...provided.draggableProps}
          >
            <div
              style={{
                backgroundColor: "white",
                marginLeft: 6,
                marginRight: 6,
                marginBottom: 5,
                marginTop: 4,
                paddingTop: 5,
                paddingBottom: 5,
                paddingLeft: 10,
                borderRadius: 4,
                boxShadow: "0px 2px 0px rgba(0,0,0,0.1)",
                cursor: "pointer",
              }}
              onClick={handleTaskDetailOpen}
            >
              {itemData.title}
            </div>
            <TaskDetail
              visible={taskDetailVisible}
              handleClose={handleTaskDetailClose}
              {...props}
            />
          </div>
        )}
      </Draggable>
    );
  } else {
    return null;
  }
}
