import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AWS from "aws-sdk";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/esm/locale";

export default function GoalModal({ id, update, setUpdate }) {
  const params = useParams();
  const navigate = useNavigate();
  const important = [
    ["사소", 1],
    ["보통", 2],
    ["중요", 3],
  ];
  const state = [
    ["Todo", "todo"],
    ["Progress", "progress"],
    ["Complete", "complete"],
  ];
  AWS.config.update({
    region: `${process.env.REACT_APP_AWS_REGION}`,
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: `${process.env.REACT_APP_AWS_IDENTITYPOOLID}`,
    }),
  });
  const [goal, setGoal] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [selectDate, setSelectDate] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  // console.log("goal :", goal);

  const DataHandler = (key, value) => {
    let newObject = goal;
    newObject[key] = value;
    setGoal({ ...newObject });
  };

  const deleteGoal = () => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/goal/${params.id}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      .then(() => {
        navigate(-1);
      });
  };

  const onEdit = () => {
    // console.log(goal, id);
    if (goal.userId === id) {
      setIsEditing(!isEditing);
    } else {
      alert("권한이 없습니다.");
    }
    if (isEditing === true) {
      axios
        .put(
          `${process.env.REACT_APP_API_URL}/goal`,
          {
            id: params.id,
            userId: id,
            projectId: params.projectId,
            goalName: goal.goalName,
            state: goal.state,
            description: goal.description,
            important: goal.important,
            deadline: goal.deadline,
            Files: goal.Files,
            Comments: goal.Comments,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        )
        .then(() => {
          setUpdate(true);
        });
    }
  };
  const deleteComment = (data) => {
    if (data.UserId === id) {
      axios
        .delete(`${process.env.REACT_APP_API_URL}/comment/${data.id}`)
        .then(() => setUpdate(true));
    }
  };

  const deleteFile = (data) => {
    if (data.UserId === id) {
      axios
        .delete(`${process.env.REACT_APP_API_URL}/file/${data.id}`)
        .then(() => setUpdate(true));
    }
  };

  const commentHandler = (e) => {
    if (e.key === "Enter" && comment) {
      axios
        .post(
          `${process.env.REACT_APP_API_URL}/comment`,
          {
            userId: id,
            projectId: params.projectId,
            goalId: params.id,
            content: e.target.value,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        )
        .then(() => {
          setComment("");
          setUpdate(true);
        });
    }
  };

  const commentClickHandler = () => {
    if (comment) {
      axios
        .post(
          `${process.env.REACT_APP_API_URL}/comment`,
          {
            userId: id,
            projectId: params.projectId,
            goalId: params.id,
            content: comment,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        )
        .then(() => {
          setComment("");
          setUpdate(true);
        });
    }
  };

  const handleFileInput = (e) => {
    // input 태그를 통해 선택한 파일 객체
    if (id !== goal.userId) {
      return;
    }

    const file = e.target.files[0];
    // const fileName = e.target.value.split("\\")[
    //   e.target.value.split("\\").length - 1
    // ];

    // S3 SDK에 내장된 업로드 함수
    const upload = new AWS.S3.ManagedUpload({
      params: {
        Bucket: `${process.env.REACT_APP_S3_FILE_BUCKET}`, // 업로드할 대상 버킷명
        Key: file.name, // 업로드할 파일명 (* 확장자를 추가해야 합니다!)
        Body: file, // 업로드할 파일 객체
      },
    });

    const promise = upload.promise();

    promise.then(
      function (data) {
        // console.log({
        //   userId: id,
        //   goalId: Number(params.id),
        //   fileName: data.key,
        //   description: data.Location,
        // });
        axios
          .post(
            `${process.env.REACT_APP_API_URL}/file`,
            {
              userId: id,
              goalId: params.id,
              fileName: data.key,
              description: data.Location,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          )
          .then(() => {
            alert("이미지 업로드에 성공했습니다.");
            setUpdate(true);
          });
      },
      function (err) {
        return alert("오류가 발생했습니다: ", err.message);
      }
    );
  };

  const LikeHandler = () => {
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/like`,
        {
          userId: id,
          goalId: Number(params.id),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      )
      .then(() => {
        setUpdate(true);
      });
  };

  const LikeDeleter = () => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/like/${goal.LikeId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      .then(() => {
        setUpdate(true);
      });
  };

  useEffect(() => {
    if (update) {
      setUpdate(false);
    } else {
      axios
        .get(
          `${process.env.REACT_APP_API_URL}/goal?goalId=${params.id}&userId=${id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        )
        .then((res) => {
          setGoal(res.data.data);
        });
    }
  }, [update, id]);

  // console.log('LikeId',goal)
  return (
    <Container>
      <ModalContainer>
        <CloseButton
          src={`${process.env.PUBLIC_URL}/images/close.png`}
          alt="close"
          onClick={() => navigate(-1)}
        />
        <EditButton
          src={`${process.env.PUBLIC_URL}/images/edit.png`}
          alt="edit"
          onClick={onEdit}
        />
        <EditContainer isEditing={isEditing}>
          <DeleteButton
            src={`${process.env.PUBLIC_URL}/images/delete.png`}
            alt="delete"
            onClick={deleteGoal}
          />
        </EditContainer>
        <Title>Mission Name</Title>
        <NoEditContainer isEditing={isEditing}>{goal.goalName}</NoEditContainer>
        <EditContainer isEditing={isEditing}>
          <input
            value={goal.goalName}
            onChange={(e) => DataHandler("goalName", e.target.value)}
            placeholder="목표 이름"
            type="text"
          />
        </EditContainer>
        <Title>State</Title>
        <NoEditContainer isEditing={isEditing}>
          {goal.state ? state.filter((el) => goal.state === el[1])[0][0] : null}
        </NoEditContainer>
        <EditContainer isEditing={isEditing}>
          <ul>
            {state.map((el) => (
              <SelectState
                onClick={() => DataHandler("state", el[1])}
                key={el[1]}
                content={el[1]}
                select={goal.state}
              >
                {el[0]}
              </SelectState>
            ))}
          </ul>
        </EditContainer>
        <Title>Deadline</Title>
        <NoEditContainer isEditing={isEditing}>{goal.deadline}</NoEditContainer>
        <EditContainer isEditing={isEditing}>
          <Daypicker>
            <StyleDatePicker
              selected={selectDate.startDate}
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              selectsStart
              endDate={selectDate.endDate}
              placeholderText="From"
              showPopperArrow={false}
              locale={ko}
              monthsShown={2}
              onChange={(date) => {
                setSelectDate({ ...selectDate, startDate: date });
                DataHandler(
                  "deadline",
                  date.toLocaleString().split(" ").join("").slice(0, 10) +
                    "~" +
                    goal.deadline.split("~")[1]
                );
              }}
            />
            <StyleDatePicker
              selected={selectDate.endDate}
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              selectsEnd
              startDate={selectDate.startDate}
              placeholderText="To"
              showPopperArrow={false}
              monthsShown={2}
              onChange={(date) => {
                setSelectDate({ ...selectDate, endDate: date });
                DataHandler(
                  "deadline",
                  goal.deadline.split("~")[0] +
                    "~" +
                    date.toLocaleString().split(" ").join("").slice(0, 10)
                );
              }}
            />
          </Daypicker>
        </EditContainer>
        <Title>Important</Title>
        <NoEditContainer isEditing={isEditing}>
          {goal.important
            ? important.filter((el) => goal.important === el[1])[0][0]
            : null}
        </NoEditContainer>
        <EditContainer isEditing={isEditing}>
          <ul>
            {important.map((el) => (
              <SelectImportant
                onClick={() => DataHandler("important", el[1])}
                key={el[1]}
                content={el[1]}
                select={goal.important}
              >
                {el[0]}
              </SelectImportant>
            ))}
          </ul>
        </EditContainer>
        <Title>Description</Title>
        <NoEditContainer isEditing={isEditing}>
          {goal.description}
        </NoEditContainer>
        <EditContainer isEditing={isEditing}>
          <textarea
            value={goal.description}
            onChange={(e) => DataHandler("description", e.target.value)}
          />
        </EditContainer>
        <NoEditLastContainer isEditing={isEditing}>
          <FileContainer>
            <Title>File</Title>
            <FileUploaderContainer onChange={handleFileInput}>
              <img
                src={`${process.env.PUBLIC_URL}/images/save.png`}
                alt="save"
              />
              <FileUploader type="file" />
            </FileUploaderContainer>
          </FileContainer>
          {goal.Files
            ? goal.Files.map((el) => (
                <FileView key={el.fileName}>
                  <Clip href={el.description}>{el.fileName}</Clip>
                  <CommentsClose
                    onClick={() => deleteFile(el)}
                    src={`${process.env.PUBLIC_URL}/images/commentDelete.png`}
                  />
                </FileView>
              ))
            : null}
          {
            // 파일 업로드 하는 방법 찾기
          }
          <Title>Comments</Title>
          {goal.Comments
            ? goal.Comments.map((el) => (
                <CommentContainer key={el.id}>
                  <CommentTitle>
                    <CommentsTitleFrame>
                      <div>{el.username}</div>
                      <div>
                        {`${el.createdAt
                          .toLocaleString()
                          .split(" ")
                          .join("")
                          .slice(0, 10)}`}
                      </div>
                    </CommentsTitleFrame>
                    <CommentsClose
                      onClick={() => deleteComment(el)}
                      src={`${process.env.PUBLIC_URL}/images/commentDelete.png`}
                    />
                  </CommentTitle>
                  <div>{el.content}</div>
                </CommentContainer>
              ))
            : null}
          <InputContainer>
            <CommentsInput
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={commentHandler}
            />
            <PressEnter onClick={commentClickHandler}>Enter</PressEnter>
          </InputContainer>
          <LikeContainer>
            <LikeBTN onClick={LikeHandler} like={goal.LikeId}>
              AGREE
            </LikeBTN>
            <LikeBTN onClick={LikeDeleter} like={!goal.LikeId}>
              REJECT
            </LikeBTN>
          </LikeContainer>
        </NoEditLastContainer>
        <Pen src={`${process.env.PUBLIC_URL}/images/pen.png`} />
      </ModalContainer>
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
`;

const ModalContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 30rem;
  border: 0.5rem solid black;
  padding: 1rem;
  background-color: white;

  ul {
    display: flex;
    align-items: flex-end;
  }

  li {
    font-size: 1.4rem;
    margin-right: 0.2rem;
  }

  textarea {
    width: 25rem;
    height: 5rem;
    resize: none;
    margin-bottom: 1.3rem;
  }

  input {
    font-size: 1.4rem;
  }
`;

const CloseButton = styled.img`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1rem;
  cursor: pointer;
`;

const EditButton = styled.img`
  position: absolute;
  top: 0.2rem;
  right: 1.7rem;
  width: 1.5rem;
  cursor: pointer;
`;

const DeleteButton = styled.img`
  position: absolute;
  top: 0.5rem;
  right: 3.5rem;
  width: 1.3rem;
  cursor: pointer;
`;

const Title = styled.div`
  font-size: 1.4rem;
  margin: 1rem 0 0.5rem 0;
`;

const Daypicker = styled.div``;

const StyleDatePicker = styled(DatePicker)`
  width: 8rem;
  font-size: 1.4rem;
  cursor: pointer;
`;

const CommentContainer = styled.div``;

const NoEditContainer = styled.div`
  display: ${(props) => (props.isEditing ? "none" : "default")};
  border-bottom: 0.2rem solid black;
  margin-right: 4rem;

  :nth-child(6) {
    border-bottom: none;
  }
`;

const NoEditLastContainer = styled.div`
  display: ${(props) => (props.isEditing ? "none" : "default")};
  margin-right: 4rem;
`;

const EditContainer = styled.div`
  display: ${(props) => (props.isEditing ? "default" : "none")};
`;

const CommentTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-flex-end;
`;

const CommentsTitleFrame = styled.div`
  display: flex;
  align-items: center;

  div {
    :first-child {
      font-size: 1.2rem;
    }

    :nth-child(2) {
      font-size: 0.9rem;
      font-weight: 600;
      color: gray;
    }
  }
`;

const CommentsClose = styled.img`
  width: 1rem;
  border-radius: 50%;
  cursor: pointer;
`;

const FileContainer = styled.div`
  display: flex;
  align-items: center;
`;

const FileUploaderContainer = styled.label`
  cursor: pointer;

  img {
    position: relative;
    top: 0.2rem;
    width: 1.5rem;
    margin-left: 0.5rem;
  }
`;

const FileUploader = styled.input`
  display: none;
`;

const InputContainer = styled.div`
  display: flex;
`;

const CommentsInput = styled.input`
  width: 20rem;
  border-bottom: 0.2rem solid black;
`;

const PressEnter = styled.div`
  font-size: 1.3rem;
  color: white;
  border-radius: 0.2rem 0.2rem 0.2rem 0;
  padding: 0.3rem;
  background-color: black;
  cursor: pointer;
`;

const Clip = styled.a`
  :hover {
    color: blue;
  }
`;

const SelectImportant = styled.li`
  color: ${(props) => (props.content === props.select ? "red" : "black")};
  cursor: pointer;
`;

const SelectState = styled.li`
  color: ${(props) => (props.content === props.select ? "red" : "black")};
  cursor: pointer;
`;

const FileView = styled.div`
  display: flex;
  justify-content: space-between;
`;

const LikeContainer = styled.div`
  display: flex;
`;

const LikeBTN = styled.button`
  width: 9rem;
  height: 3rem;
  font-size: 2rem;
  color: ${(props) => (props.like ? "white" : "black")};
  font-family: anton;
  background-color: ${(props) => (props.like ? "black" : "white")};
  margin: 1rem;
`;

const Pen = styled.img`
  position: absolute;
  top: 6rem;
  right: -5rem;
  width: 15rem;
  transform: rotate(-45deg);
`;
