import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import disableScroll from "disable-scroll";

import Main from "./pages/Main";
import Nav from "./components/nav_bar/Nav";
import { InProgress } from "./mockdata/MyPageProjectData";
import Project from "./pages/Project";
import GoalModal from "./components/project/GoalModal";
import { Complete, ProjectStatics } from "./pages/Complete";
import {
  MyPage,
  Profile,
  ProjectInProgress,
  ProjectDone,
} from "./pages/MyPage";

export default function App() {
  const [userData, setUserData] = useState(InProgress);
  const [userInfo, setUserInfo] = useState({
    id: 1,
    username: "demouser",
    email: "demouser@nbbang.com",
    profile: null,
    createdAt: "2021-11-09T14:20:45.000Z",
    updatedAt: "2021-11-09T14:20:45.000Z",
  });
  const [isModal, setIsModal] = useState(false);
  const [signAndLogin, setSignAndLogin] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [isMypage, setIsMypage] = useState(false);
  const [switchBtn, setSwitchBtn] = useState(false);
  const [isOn, setIsOn] = useState(false);

  const handleNavbar = () => {
    setIsLogin(true);
    setIsModal(!isModal);
    disableScroll.off();
  };

  const handleSignAndLogin = () => {
    setIsOn(true);
    setTimeout(() => {
      if (signAndLogin === "login") {
        setSignAndLogin("signup");
      } else {
        setSignAndLogin("login");
      }
      setIsOn(false);
    }, 500);
  };

  const handleModal = (e) => {
    if (
      e.target.firstChild.innerText === "Login" ||
      e.target.innerText === "Login"
    ) {
      setSignAndLogin("login");
    } else {
      setSignAndLogin("signup");
    }
    setIsModal(!isModal);
    if (isModal !== true) {
      disableScroll.on();
    } else {
      disableScroll.off();
    }
  };

  const handleMypage = () => {
    setSwitchBtn(true);
    setIsMypage(!isMypage);
  };
  const handleOffMypage = () => {
    setSwitchBtn(false);
    setIsMypage(false);
  };

  // 토큰이 유효하면 로그인 상태 유지 아니면 로그아웃

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/users`, {
        withCredentials: true,
      })
      .then((data) => {
        setUserInfo(data.data.data.userInfo);
        setIsLogin(true);
        return data.data.data.userInfo.id;
      })
      .then((data) => {
        axios(`${process.env.REACT_APP_API_URL}/project/${data}}`)
          .then((data) => {
            console.log(data.data);
            setUserData(data.data);
          })
          .catch((err) => console.log(err.response));
      })
      .catch((err) => {
        console.log(`쿠키 ${err.response}`);
        setIsLogin(false);
      });
    // await axios
    //   .get(`${process.env.REACT_APP_API_URL}/project/${userInfo.id}`)
    //   .then((data) => setUserData(data.data.data))
    //   .catch((err) => console.log(err));
    //axios 요청으로 유저의 프로젝트 정보를 받아 와서 스테이트 관리해준다!
  }, [isLogin]);
  return (
    <Router>
      <Container>
        <Frame>
          <Nav
            isModal={isModal}
            handleModal={handleModal}
            isLogin={isLogin}
            handleMypage={handleMypage}
            handleOffMypage={handleOffMypage}
            isMypage={isMypage}
            userInfo={userInfo}
            userData={userData}
            switchBtn={switchBtn}
          />
          <Routes>
            <Route
              path="/"
              element={
                <Main
                  isModal={isModal}
                  handleModal={handleModal}
                  handleSignAndLogin={handleSignAndLogin}
                  signAndLogin={signAndLogin}
                  handleNavbar={handleNavbar}
                  isOn={isOn}
                />
              }
            />
            <Route path="mypage" element={<MyPage />}>
              <Route path="profile" element={<Profile />} />
              <Route
                path="project-inprogress"
                element={
                  <ProjectInProgress
                    userData={userData}
                    setUserData={setUserData}
                  />
                }
              />
              <Route path="project-done" element={<ProjectDone />} />
            </Route>
            <Route
              path="project/:projectId"
              element={<Project id={userInfo.id} />}
            >
              <Route path=":id" element={<GoalModal />} />
            </Route>
          </Routes>
        </Frame>
      </Container>
    </Router>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  /* width: 100vw; */
  /* min-height: 100vh; */
  width: 100%;
  position: relative;
  background-color: #f6f2f1;
`;

const Frame = styled.div`
  position: relative;
  width: 88vw;
  border: 5px solid black;
  margin: 5rem 0 5rem 0;
`;
