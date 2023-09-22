import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import styled from "@emotion/styled";

const StepByStep = () => {
  return (
    <Container>
      <TitleContainer>
        Checky : 단 5초, GPT로 컨텐츠 한눈에 체크하고 광고 분류까지
      </TitleContainer>
      <OpacityTab>
        <Tabs
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
          variant="soft-rounded"
          colorScheme="green"
        >
          <TabList
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              '& [aria-selected="true"]': {
                color: "white",
                bg: "purple",
              },
              '& [aria-selected="false"]': {
                color: "black",
                bg: "white",
              },
              fontSize: "20px",
              gap: "10px",
            }}
          >
            <Tab>1</Tab>
            <Tab>2</Tab>
            <Tab>3</Tab>
            <Tab>4</Tab>
          </TabList>
          <TabPanels
            sx={{
              width: "400px",
              height: "350px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "white",
              borderRadius: "10px",
              color: "black",
              margin: "20px 0 0 0",
            }}
          >
            <TabPanel
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <TitleText>시작하기</TitleText>
              <SubTitleText>Access Token을 확인합니다.</SubTitleText>
              <div>
                체키를 활용하기 위해서는 두 가지 방법이 있습니다. GPT 3.5를 기본
                모델로 사용하고 GPT 4를 선택적으로 사용할 수 있습니다. GPT 4는
                더욱 정확한 요약을 제공합니다.
              </div>
              <LinkButton>OpenAI 로그인</LinkButton>
            </TabPanel>
            <TabPanel
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <TitleText>OPEN API KEY 입력하기</TitleText>
              <SubTitleText>
                안타깝지만 여기서는 API KEY를 입력해야 합니다.
              </SubTitleText>
              <div>
                OPEN AI에 로그인하고 계시지 않은 것 같습니다. 로그인을
                원하신다면 다시 처음으로 돌아가거나 API KEY를 우선 입력할 수
                있습니다.
              </div>
            </TabPanel>
            <TabPanel
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <TitleText>탭에서 사용하기</TitleText>
              <SubTitleText>언제나 접근 가능한 고정형 구조</SubTitleText>
              <div>
                크롬을 열고 검색한 다음 사이드에서 체키를 사용해보세요. 체키는
                구글 검색 화면의 오른쪽에 고정됩니다. 당신이 탐색하길 원하는
                링크의 제목을 입력하면 체키가 빠르게 내용을 요약해줍니다.
              </div>
            </TabPanel>
            <TabPanel
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <TitleText>체키 확장하기</TitleText>
              <SubTitleText>
                체키는 드래그로도 검색이 가능합니다. 아마도 이것은 GPT에게 직접
                질문을 던지는 것과 같습니다. 당신이 원하는 정보를 빠르게
                찾아보세요.
              </SubTitleText>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </OpacityTab>
    </Container>
  );
};

export default StepByStep;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  padding: 24px 24px 0 24px;
  display: flex;
  flex-direction: column;
  align-items: space-between;
  justify-content: center;
`;

const OpacityTab = styled.div`
  flex: 1;
  height: 80%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  border-radius: 20px;
`;

const TitleContainer = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #ffffff;
  padding: 10px;
  z-index: 2;
  margin: auto;
  height: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CenterContainer = styled.div`
  width: 400px;
  height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 10px;
  color: black;
`;

const StepIndicator = styled.div`
  margin: 10px 0;
  width: 400px;
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;

  & ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    width: 100%;
    height: 100%;
  }

  & li {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #ffffff;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    color: #000000;
    &:nth-child(1) {
      background-color: #4f5bff;
      color: #ffffff;
    }
  }
`;

const TitleText = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #0066ff;
  padding: 10px;
`;

const SubTitleText = styled.div`
  font-size: 14px;
  color: black;
  padding: 10px;
`;

const LinkButton = styled.button`
  width: 200px;
  height: 50px;
  background-color: #ffffff;
  color: #4f5bff;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease-in-out;
  margin: 20px 0 0 0;
  border: 2px solid #4f5bff;
  &:hover {
    cursor: pointer;
    background-color: #4f5bff;
    color: #ffffff;
  }
`;
