import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import OptionBox, { OptionBoxProps } from "../OptionBox/OptionBox";
import LoginZone from "./LoginZone";
import InputZone from "./InputZone";
import popupStateMachine from "@src/pages/popup/xState/popupStateMachine";
import { useMachine } from "@xstate/react";

const themeList: OptionBoxProps[] = [
  {
    title: "OPEN AI 로그인",
    content: "OPEN AI에서 인증 정보를 가져와요",
    buttonText: "로그인하기",
    nextStage: 1,
    disabled: true,
  },
  {
    title: "API KEY 입력",
    content: "Checky를 이용하는 가장 쉬운 방법",
    buttonText: "API KEY 입력하기",
    nextStage: 2,
    disabled: false,
  },
];

const InitZone = () => {
  const [stage, setStage] = useState(0);
  const [myApiKey, setMyApiKey] = useState("");
  const [myAccessToken, setMyAccessToken] = useState("");

  // storage에 저장된 api key가 있는지 확인
  useEffect(() => {
    chrome.storage.local.get(["openAiApiKey"], (result) => {
      if (result.openAiApiKey) {
        setMyApiKey(result.openAiApiKey);
      }
    });

    chrome.storage.local.get(["openAiAccessToken"], (result) => {
      if (result.openAiAccessToken) {
        setMyAccessToken(result.openAiAccessToken);
      }
    });
  }, []);

  return (
    <Container>
      {stage === 0 && (
        <div
          style={{
            display: "flex",
            gap: "20px",
          }}
        >
          {themeList.map((item, index) => (
            <OptionBox
              key={index}
              title={item.title}
              content={item.content}
              buttonText={item.buttonText}
              nextStage={item.nextStage}
              setStage={setStage}
              disabled={item.disabled}
            />
          ))}
        </div>
      )}
      {stage === 1 && <LoginZone />}
      {stage === 2 && <InputZone />}
      <BottomBox />
    </Container>
  );
};

const Container = styled.div`
  background-color: #181822;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding-bottom: 100px;
`;

const BottomBox = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 400px;
  background: linear-gradient(
    360deg,
    rgba(31, 54, 138, 0.8) 4.92%,
    rgba(31, 54, 138, 0) 89.51%
  );
`;

export default InitZone;
