import React, { useState, useContext, useEffect } from "react";
import { Layout, Button, Row, Col, Typography, message } from "antd";
import axios from "axios";
import qs from "qs";
import { FlashCard, CreateBoard } from "../components";
import Context from "../store/context";
import "./Boards.css";

const { Header, Content } = Layout;

export default function Boards(props) {
  const [pageLoading, setPageLoading] = useState(true);
  const [createBoardVisible, setCreateBoardVisible] = useState(false);
  const [boardsList, setBoardsList] = useState([]);
  const { globalState, globalDispatch } = useContext(Context);

  useEffect(() => {
    const getBoards = async () => {
      const boardIds = globalState.userData.boards;
      console.log("BOARD IDS in useEffect", boardIds);

      if (boardIds.length) {
        axios
          .get("/boards/multiple", {
            params: { boardIds: JSON.stringify(boardIds) },
            paramsSerializer: (params) => {
              return qs.stringify(params);
            },
          })
          .then(
            (response) => {
              const { success, error, data } = response.data;
              if (success) {
                setBoardsList(data);
              } else {
                console.log(error);
              }
            },
            (err) => {
              console.error("GET /boards/multiple", err);
            }
          );
      }

      setPageLoading(false);
    };

    getBoards();
  }, [globalState.userData.boards]);

  const handleCreateBoardPress = () => {
    setCreateBoardVisible(true);
  };

  const handleCreateBoardClose = () => {
    setCreateBoardVisible(false);
  };

  const handleDeleteBoard = (board_id) => {
    console.log("DELETE board_id", board_id);

    axios
      .delete("/boards", { params: { board_id } })
      .then(
        (response) => {
          if (response.data.success) {
            setBoardsList((prevBoardIds) => {
              let newBoardIds = prevBoardIds
                .filter((eachBoard) => eachBoard.id !== board_id)
                .map((board) => board.id);
              globalDispatch({ type: "BOARDS_UPDATE", boards: newBoardIds });
              return newBoardIds;
            });
            message.success("Board deleted successfully");
          } else {
            throw new Error(response.data.error);
          }
        },
        (error) => {
          throw new Error(error);
        }
      )
      .catch((e) => {
        message.error(`Failed to delete board`);
        console.error("DELETE /boards : ", e);
      });
  };

  const handleAddNewBoard = (board_data) => {
    setBoardsList((prevBoardIds) => prevBoardIds.concat(board_data));
  };

  return (
    <Layout
      className="transparent-bg padding fullscreen"
      style={{
        backgroundColor: "transparent",
      }}
    >
      <Header
        className="transparent-bg header"
        style={{
          backgroundColor: "transparent",
          paddingLeft: 0,
          paddingRight: 0,
        }}
      >
        <Row justify="space-between" align="middle">
          <div className="title">Boards</div>
          <Button type="primary" onClick={handleCreateBoardPress}>
            Create Board
          </Button>
        </Row>
      </Header>
      <Content>
        {boardsList.length ? (
          <Row gutter={[40, 40]}>
            {boardsList.map((eachBoard) => (
              <Col key={eachBoard.id} span={8}>
                <FlashCard {...eachBoard} onDelete={handleDeleteBoard} />
              </Col>
            ))}
          </Row>
        ) : (
          <Typography.Text type="secondary">
            No boards created yet
          </Typography.Text>
        )}
      </Content>
      <CreateBoard
        visible={createBoardVisible}
        onClose={handleCreateBoardClose}
        onCreate={handleAddNewBoard}
      />
    </Layout>
  );
}
