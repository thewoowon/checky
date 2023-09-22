import styled from "@emotion/styled";
import ChatGPT_logo from "../../assets/ChatGPT_logo.svg";

export type OptionBoxProps = {
  title: string;
  content: string;
  buttonText: string;
  nextStage?: number;
  setStage?: React.Dispatch<React.SetStateAction<number>>;
  disabled?: boolean;
};

const OptionBox = ({
  title,
  content,
  buttonText,
  nextStage,
  setStage,
  disabled,
}: OptionBoxProps) => {
  return (
    <Container>
      <FlexBox direction="row" gap="10px">
        <img src={ChatGPT_logo} alt="openai" width={64} />
        {title}
      </FlexBox>
      <MiddleContainer>{content}</MiddleContainer>
      <BaseButton
        disabled={disabled || false}
        onClick={() => {
          setStage && setStage(nextStage || 0);
        }}
      >
        {buttonText}
      </BaseButton>
    </Container>
  );
};

export default OptionBox;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 330px;
  height: 304px;
  background: linear-gradient(
    180deg,
    rgba(73, 75, 87, 0.6) 0%,
    rgba(30, 30, 40, 0.6) 100%
  );
  border: 1px solid #494b57;
  box-shadow: 0px 0.25rem 0.9375rem rgba(0, 0, 0, 0.25);
  border-radius: 0.625rem;
  transition: all 0.3s ease-in-out;
  &:hover {
    background: linear-gradient(
        180deg,
        rgba(73, 75, 87, 0.6) 0%,
        rgba(30, 30, 40, 0.6) 100%
      ),
      linear-gradient(90deg, #6713d3 0%, #9746ff 100%);
    border: 1px solid #494b57;
    box-shadow: 0px 0.25rem 0.9375rem rgba(0, 0, 0, 0.25);
    border-radius: 0.625rem;
    transform: translateY(-5px);
  }
  padding: 20px;
  gap: 20px;
`;

const BaseButton = styled.button`
  background: linear-gradient(90deg, #6713d3 0%, #9746ff 100%);
  font-size: 1.125rem;
  line-height: 1.5rem;
  font-weight: 700;
  width: 16.5rem;
  color: #ffffff;
  border-radius: 100px;
  height: 3.125rem;
  border: none;
  cursor: pointer;
  text-align: center;
`;

const IconContainer = styled.div`
  width: 30px;
  height: 30px;
`;

const FlexBox = styled.div<{ direction: string; gap: string }>`
  display: flex;
  flex-direction: ${(props) => props.direction};
  gap: ${(props) => props.gap};
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  padding: 10px;
`;

const MiddleContainer = styled.div`
  width: 100%;
  color: #ced2da;
  padding: 10px 0;
  font-size: 18px;
  font-weight: bold;
`;
