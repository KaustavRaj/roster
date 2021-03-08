import React, { useState, useContext, useEffect } from "react";
import { Layout, Button, Row, Col, Typography, message } from "antd";
import axios from "axios";
import qs from "qs";
import { FlashCard, CreateBoard, LoadingScreen } from "../components";
import Context from "../store/context";
import "./Boards.css";

const { Header, Content } = Layout;

export default function Boards(props) {
  const [pageLoading, setPageLoading] = useState(true);
  const [createBoardVisible, setCreateBoardVisible] = useState(false);
  const [boardsList, setBoardsList] = useState([]);
  const { globalState, globalDispatch } = useContext(Context);
  const MULTIPLE_BOARDS_URL = "/api/boards/multiple";
  const DELETE_BOARD_URL = "/api/boards";

  useEffect(() => {
    const getBoards = async () => {
      const boardIds = globalState.userData.boards;

      if (boardIds.length) {
        axios
          .get(MULTIPLE_BOARDS_URL, {
            params: { boardIds: JSON.stringify(boardIds) },
            paramsSerializer: (params) => {
              return qs.stringify(params);
            },
          })
          .then(
            (response) => {
              const { success, error, data } = response.data;
              if (success) {
                console.log("--------------BOARD DATA--------------");
                console.log(data);
                setBoardsList(data);
              } else {
                console.log(error);
              }
            },
            (err) => {
              console.error("GET /boards/multiple", err);
            }
          )
          .finally(() => {
            setPageLoading(false);
          });
      }
    };

    getBoards();
  }, []);

  const handleCreateBoardPress = () => {
    setCreateBoardVisible(true);
  };

  const handleCreateBoardClose = () => {
    setCreateBoardVisible(false);
  };

  const handleDeleteBoard = (board_id) => {
    console.log("DELETE board_id", board_id);

    axios
      .delete(DELETE_BOARD_URL, { params: { board_id } })
      .then(
        (response) => {
          if (response.data.success) {
            setBoardsList((prevBoardIds) => {
              globalDispatch({ type: "BOARD_DELETE", board_id: board_id });
              let newBoardIds = prevBoardIds
                .filter((eachBoard) => eachBoard.id !== board_id)
                .map((board) => board.id);
              return newBoardIds;
            });
          } else {
            throw new Error(response.data.error);
          }
        },
        (error) => {
          throw new Error(error);
        }
      )
      .catch((e) => {
        console.log("DELETE /boards : ", e);
      });
  };

  const handleAddNewBoard = (board_data) => {
    setBoardsList((prevBoardList) => {
      globalDispatch({ type: "BOARD_ADD", board_id: board_data.id });
      return prevBoardList.concat(board_data);
    });
  };

  return pageLoading ? (
    <LoadingScreen />
  ) : (
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
                <FlashCard boardData={eachBoard} onDelete={handleDeleteBoard} />
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
